"""
Extract useful metadata from the EIPs repo
"""

import logging
import os
from typing import List

import git
import re

from worker import BACKEND_PATH
from schemas import EIP
import frontmatter

logger = logging.getLogger(__name__)

REPO_CLONE_URL = "https://github.com/ethereum/EIPs.git"
LOCAL_REPO_PATH = os.path.join(BACKEND_PATH, "eips-repo")


def checkout() -> None:
    if os.path.exists(LOCAL_REPO_PATH):
        logger.info(f"Deleting {LOCAL_REPO_PATH}...")
        os.system(f"rm -rf {LOCAL_REPO_PATH}")

    os.makedirs(LOCAL_REPO_PATH, exist_ok=True)

    logger.info(f"Cloning {REPO_CLONE_URL} to {LOCAL_REPO_PATH}...")
    repo = git.Repo.clone_from(REPO_CLONE_URL, LOCAL_REPO_PATH)
    logger.info("Done cloning.")


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

    print(requires)

    return EIP(
        eip=metadata["eip"],
        title=metadata["title"],
        author=metadata["author"],
        status=metadata["status"],
        type=metadata["type"],
        category=metadata.get("category"),
        created=metadata["created"],
        requires=requires,
        content=content,
    )


def extract_eips() -> List[EIP]:
    eips_folder = os.path.join(LOCAL_REPO_PATH, "EIPS")
    eips = []

    for filename in os.listdir(eips_folder):
        if filename.startswith("eip-"):
            eip = _extract_eip(os.path.join(eips_folder, filename))
            eips.append(eip)

    return eips

eips = extract_eips()


# checkout()

# from pydriller import Repository

# repo = Repository(LOCAL_REPO_PATH)

# commits = list(repo.traverse_commits())

# # for commit in commits:
# #     _get_modified_files(commit)

# commit = commits[-1]

# print(commit.hash)
# for m in commit.modified_files:
#     # print(
#     #     "Author {}".format(commit.author.name),
#     #     " modified {}".format(m.filename),
#     #     " with a change type of {}".format(m.change_type.name),
#     #     " and the complexity is {}".format(m.complexity)
#     # )
#     print(m.filename)
#     print(m.diff_parsed)


# print(commit.hexsha)

# diffs = commit.diff(commit.parents or [])

# for diff in diffs:
#     print(diff.change_type, diff.a_path, diff.b_path)
#     print(diff.diff('HEAD~1'))

# for diff_added in commit.diff("HEAD~1").iter_change_type("M"):
#     print(diff_added)
