"""
Extract useful metadata from the EIPs repo
"""

import logging
import os
import re
from datetime import datetime, timezone
from typing import List, Optional
import requests
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from typing import Optional
import time
import frontmatter
import git
from pydriller import Commit, Repository

from eips.schemas import EIP, EIPCommit, EIPDiff
from eips.worker import BACKEND_PATH

logger = logging.getLogger(__name__)

REPO_CLONE_URL = "https://github.com/ethereum/EIPs.git"
LOCAL_REPO_PATH = os.path.join(BACKEND_PATH, "eips-repo")


def checkout_repo() -> None:
    if os.path.exists(LOCAL_REPO_PATH):
        logger.info(f"Deleting {LOCAL_REPO_PATH}...")
        os.system(f"rm -rf {LOCAL_REPO_PATH}")

    os.makedirs(LOCAL_REPO_PATH, exist_ok=True)

    logger.info(f"Cloning {REPO_CLONE_URL} to {LOCAL_REPO_PATH}...")
    repo = git.Repo.clone_from(REPO_CLONE_URL, LOCAL_REPO_PATH)
    logger.info("Done cloning.")


def delete_repo() -> None:
    if os.path.exists(LOCAL_REPO_PATH):
        logger.info(f"Deleting {LOCAL_REPO_PATH}...")
        os.system(f"rm -rf {LOCAL_REPO_PATH}")


def _get_modified_files(commit) -> List[str]:
    modified_files = []

    for diff in commit.diff(commit.parents or []):
        if diff.change_type == "M":
            modified_files.append(diff.b_path)

    return modified_files


def _get_category(metadata: dict) -> Optional[str]:
    if metadata.get("type") == "Meta":
        # Meta EIPs don't have a category
        return "Meta"

    if metadata.get("type") == "Informational":
        # Informational EIPs don't have a category
        return "Informational"

    return metadata.get("category")


def _get_discussion_count(url) -> Optional[int]:
    parsed_url = urlparse(url)
    domain = parsed_url.netloc

    if domain == "ethereum-magicians.org":
        logger.info(f"Getting discussion count for {url}...")
        response = requests.get(url)

        soup = BeautifulSoup(response.text, "html.parser")
        count = len(soup.find_all("div", class_="topic-body crawler-post"))
        logger.info(f"Found discussion count for {url}  {count}")
        time.sleep(1)
        return count


def _extract_eip(eip_path: str) -> EIP:
    # Extracting EIPs from markdown files
    with open(eip_path, "r") as file:
        content = file.read()

    metadata, content = frontmatter.parse(content)

    requires = metadata.get("requires", [])
    if isinstance(requires, str) and "," in requires:
        requires = [int(r) for r in requires.split(",")]

    if isinstance(requires, int):
        requires = [requires]

    # Extracting discussion count from discussion link
    discussion = metadata.get("discussions-to")
    count = None
    try:
        count = _get_discussion_count(metadata["discussions-to"])
    except Exception as e:
        logger.error(f"Error getting discussion count for {discussion}: {e}")
        pass

    return EIP(
        eip=metadata["eip"],
        title=metadata["title"],
        author=metadata["author"],
        status=metadata["status"],
        type=metadata["type"],
        discussion=discussion,
        discussion_count=count,
        category=_get_category(metadata),
        created=metadata["created"],
        requires=requires,
        last_call_deadline=metadata.get("last-call-deadline"),
        content=content,
    )


def extract_eips(repo_path: str = LOCAL_REPO_PATH) -> List[EIP]:
    logger.info("Extracting EIPs...")
    eips_folder = os.path.join(repo_path, "EIPS")
    eips = []

    for filename in os.listdir(eips_folder):
        if filename.startswith("eip-"):
            eip = _extract_eip(os.path.join(eips_folder, filename))
            eips.append(eip)

    return eips


def _is_eip_filename(filename) -> bool:
    pattern = r"eip-\d+\.md"
    return bool(re.match(pattern, filename))


def _parse_commit_for_eip_diffs(commit: Commit) -> List[EIPDiff]:
    eip_diffs = []

    for m in commit.modified_files:
        if _is_eip_filename(m.filename):
            eip_diffs.append(
                EIPDiff(
                    eip=int(m.filename.split("-")[1].split(".")[0]),
                    hexsha=commit.hash,
                )
            )

    return eip_diffs


def _git_tzoffset_to_datetime(dt) -> datetime:
    return dt.astimezone(timezone.utc)


def get_commits(repo_path: str = LOCAL_REPO_PATH) -> List[EIPCommit]:
    logger.info("Extracting commits...")
    repo = Repository(repo_path)
    commits = []
    for commit in repo.traverse_commits():
        eip_diffs = _parse_commit_for_eip_diffs(commit)

        eip_commit = EIPCommit(
            hexsha=commit.hash,
            committed_datetime=commit.committer_date.astimezone(timezone.utc),
            authored_datetime=commit.author_date.astimezone(timezone.utc),
            message=commit.msg,
            author_email=commit.author.email,
            author_name=commit.author.name,
            eip_diffs=eip_diffs,
        )
        commits.append(eip_commit)

    return commits


def _insert_eips(db_conn, eips: List[EIP]) -> None:
    logger.info("Inserting EIPs...")
    with db_conn.cursor() as cursor:
        for eip in eips:
            cursor.execute(
                """
                INSERT INTO eips (
                    eip,
                    title,
                    author,
                    status,
                    type,
                    discussion,
                    discussion_count,
                    category,
                    created,
                    requires,
                    last_call_deadline,
                    content
                ) VALUES (
                    %(eip)s,
                    %(title)s,
                    %(author)s,
                    %(status)s,
                    %(type)s,
                    %(discussion)s,
                    %(discussion_count)s,
                    %(category)s,
                    %(created)s,
                    %(requires)s,
                    %(last_call_deadline)s,
                    %(content)s
                )
                ON CONFLICT (eip) DO UPDATE SET
                    title = %(title)s,
                    author = %(author)s,
                    status = %(status)s,
                    type = %(type)s,
                    discussion = %(discussion)s,
                    discussion_count = %(discussion_count)s,
                    category = %(category)s,
                    created = %(created)s,
                    requires = %(requires)s,
                    last_call_deadline = %(last_call_deadline)s,
                    content = %(content)s
                """,
                eip.dict(),
            )
        db_conn.commit()


def _insert_commits(db_conn, commits: List[EIPCommit]) -> None:
    logger.info("Inserting commits...")
    with db_conn.cursor() as cursor:
        for commit in commits:
            cursor.execute(
                """
                INSERT INTO commits (
                    hexsha,
                    committed_datetime,
                    authored_datetime,
                    message,
                    author_email,
                    author_name
                ) VALUES (
                    %(hexsha)s,
                    %(committed_datetime)s,
                    %(authored_datetime)s,
                    %(message)s,
                    %(author_email)s,
                    %(author_name)s
                )
                ON CONFLICT (hexsha) DO UPDATE SET
                    committed_datetime = %(committed_datetime)s,
                    authored_datetime = %(authored_datetime)s,
                    message = %(message)s,
                    author_email = %(author_email)s,
                    author_name = %(author_name)s
                """,
                commit.dict(),
            )
            for eip_diff in commit.eip_diffs:
                cursor.execute(
                    """
                    INSERT INTO eip_diffs (
                        hexsha,
                        eip
                    ) VALUES (
                        %(hexsha)s,
                        %(eip)s
                    )
                    ON CONFLICT (hexsha, eip) DO NOTHING
                    """,
                    eip_diff.dict(),
                )
        db_conn.commit()


def process_extraction(db_conn):
    logger.info("Extracting EIPs...")
    checkout_repo()
    eips = extract_eips()
    commits = get_commits()
    _insert_eips(db_conn, eips)
    _insert_commits(db_conn, commits)
    delete_repo()
