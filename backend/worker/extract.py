"""
Extract 
"""

import git
import os 
from worker import BACKEND_PATH

repo_clone_url = "git@github.com:ethereum/EIPs.git"
local_repo = os.path.join(BACKEND_PATH, "eips-repo")
repo = git.Repo.clone_from(repo_clone_url, local_repo)

# repo = git.Repo(local_repo)
# from worker import PATH, BACKEND_PATH
# print(PATH)
# print(BACKEND_PATH)
