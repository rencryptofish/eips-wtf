import logging
import os

from worker import BACKEND_PATH
from worker.extract import process_extraction

logging.basicConfig(level=logging.INFO)


process_extraction()
