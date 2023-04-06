"""
Extract useful metadata from the EIPs repo
"""

import git
import os
from worker import BACKEND_PATH
import logging

logger = logging.getLogger(__name__)

REPO_CLONE_URL = "https://github.com/ethereum/EIPs.git"
LOCAL_REPO_PATH = os.path.join(BACKEND_PATH, "eips-repo")


def checkout():
    if os.path.exists(LOCAL_REPO_PATH):
        logger.info(f"Deleting {LOCAL_REPO_PATH}...")
        os.system(f"rm -rf {LOCAL_REPO_PATH}")

    os.makedirs(LOCAL_REPO_PATH, exist_ok=True)

    logger.info(f"Cloning {REPO_CLONE_URL} to {LOCAL_REPO_PATH}...")
    repo = git.Repo.clone_from(REPO_CLONE_URL, LOCAL_REPO_PATH)


checkout()
