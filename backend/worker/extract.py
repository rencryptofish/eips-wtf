"""
Extract useful metadata from the EIPs repo
"""

import logging
import os
import re
from datetime import datetime, timedelta, timezone
from typing import List

import frontmatter
import git
from pydriller import Commit, Repository

from schemas import EIP, EIPCommit, EIPContributor, EIPDiff
from worker import BACKEND_PATH

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
        print(diff.change_type, diff.a_path, diff.b_path)
        if diff.change_type == "M":
            modified_files.append(diff.b_path)

    return modified_files


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

    return EIP(
        eip=metadata["eip"],
        title=metadata["title"],
        author=metadata["author"],
        status=metadata["status"],
        type=metadata["type"],
        category=metadata.get("category"),
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
            author=EIPContributor(
                email=commit.author.email,
                name=commit.author.name,
            ),
            eip_diffs=eip_diffs,
        )
        commits.append(eip_commit)

    return commits


def process_extraction():
    logger.info("Extracting EIPs...")
    checkout_repo()
    eips = extract_eips()
    commits = get_commits()
    delete_repo()
