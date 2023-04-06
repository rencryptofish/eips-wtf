import logging

from db import db_env_init
from worker.extract import process_extraction

logging.basicConfig(level=logging.INFO)

db_conn = db_env_init()
process_extraction(db_conn)
