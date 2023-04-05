import os
from worker import BACKEND_PATH
from worker.extract import checkout

print("testing main.py")
print(BACKEND_PATH)

print("testing checkout")
checkout()