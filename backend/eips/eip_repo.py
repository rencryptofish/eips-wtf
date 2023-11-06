import logging
import os
import re
import time
from abc import ABC, abstractmethod
from datetime import timezone
from typing import List, Optional
from urllib.parse import urlparse

import frontmatter
import git
import requests
from bs4 import BeautifulSoup
from pydriller import Commit, Repository

from eips.schemas import EIP, EIPCommit, EIPDiff
from eips.worker import BACKEND_PATH

logger = logging.getLogger(__name__)


class BaseEIPRepo(ABC):
    git_url: str
    eip_folder: str  # folder where EIPs are stored
    eip_prefix: str  # prefix of EIP filenames
    local_repo_path: str

    def __init__(self, git_url: str, eip_folder: str, eip_prefix: str) -> None:
        super().__init__()
        self.git_url = git_url
        self.eip_folder = eip_folder
        self.eip_prefix = eip_prefix
        repo_name = git_url.split("/")[-1].replace(".git", "")
        self.local_repo_path = os.path.join(BACKEND_PATH, repo_name)

    def checkout_repo(self) -> None:
        if os.path.exists(self.local_repo_path):
            logger.info(f"Deleting {self.local_repo_path}...")
            os.system(f"rm -rf {self.local_repo_path}")

        os.makedirs(self.local_repo_path, exist_ok=True)

        logger.info(f"Cloning {self.git_url} to {self.local_repo_path}...")
        repo = git.Repo.clone_from(self.git_url, self.local_repo_path)
        logger.info("Done cloning.")

    def delete_repo(self) -> None:
        if os.path.exists(self.local_repo_path):
            logger.info(f"Deleting {self.local_repo_path}...")
            os.system(f"rm -rf {self.local_repo_path}")

    @abstractmethod
    def _extract_eip(self, eip_path: str) -> Optional[EIP]:
        pass

    def extract_eips(self) -> List[EIP]:
        logger.info("Extracting EIPs...")
        eips_folder = os.path.join(self.local_repo_path, self.eip_folder)
        eips = []

        for filename in os.listdir(eips_folder):
            if filename.startswith(self.eip_prefix):
                eip_path = os.path.join(eips_folder, filename)
                eip = self._extract_eip(eip_path)
                if eip:
                    eips.append(eip)

        return eips

    def _is_eip_filename(self, filename: str) -> bool:
        pattern = rf"{self.eip_prefix}-\d+\.md"
        return bool(re.match(pattern, filename))

    def _parse_commit_for_eip_diffs(self, commit: Commit) -> List[EIPDiff]:
        eip_diffs = []

        for m in commit.modified_files:
            if self._is_eip_filename(m.filename):
                eip_diffs.append(
                    EIPDiff(
                        eip=int(m.filename.split("-")[1].split(".")[0]),
                        hexsha=commit.hash,
                    )
                )

        return eip_diffs

    def extract_eip_commits(self) -> List[EIPCommit]:
        logger.info("Extracting commits...")
        repo = Repository(self.local_repo_path)
        commits = []
        for commit in repo.traverse_commits():
            eip_diffs = self._parse_commit_for_eip_diffs(commit)

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


class EIPCoreRepo(BaseEIPRepo):
    def _extract_eip(self, eip_path: str) -> Optional[EIP]:
        logger.info(f"Extracting EIP from {eip_path}...")
        # Extracting EIPs from markdown files
        with open(eip_path, "r") as file:
            content = file.read()

        metadata, content = frontmatter.parse(content)

        if metadata.get("category") == "ERC":
            # Skip ERCs because they got migrated to their own repo
            return None

        requires = metadata.get("requires", [])
        if isinstance(requires, str) and "," in requires:
            requires = [int(r) for r in requires.split(",")]

        if isinstance(requires, int):
            requires = [requires]

        # Extracting discussion count from discussion link
        discussion = metadata.get("discussions-to")
        count = None

        if discussion:
            count = _get_discussion_count(metadata["discussions-to"])

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


class EIPERCRepo(BaseEIPRepo):
    def _extract_eip(self, eip_path: str) -> Optional[EIP]:
        logger.info(f"Extracting EIP from {eip_path}...")
        # Extracting EIPs from markdown files
        with open(eip_path, "r") as file:
            content = file.read()

        metadata, content = frontmatter.parse(content)

        if metadata.get("category") != "ERC":
            # Skip ERCs because they got migrated to their own repo
            return None

        requires = metadata.get("requires", [])
        if isinstance(requires, str) and "," in requires:
            requires = [int(r) for r in requires.split(",")]

        if isinstance(requires, int):
            requires = [requires]

        # Extracting discussion count from discussion link
        discussion = metadata.get("discussions-to")
        count = None

        if discussion:
            count = _get_discussion_count(metadata["discussions-to"])

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
