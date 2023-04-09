import logging

from eips.db import get_db_conn
from eips.worker.extract import process_extraction

logging.basicConfig(level=logging.INFO)

if __name__ == "__main__":
    db_conn = get_db_conn()
    process_extraction(db_conn)
