import os
from worker import BACKEND_PATH
from worker.extract import checkout
import logging


logging.basicConfig(level=logging.INFO)


print("testing main.py")
print(BACKEND_PATH)

print("testing checkout")
checkout()
