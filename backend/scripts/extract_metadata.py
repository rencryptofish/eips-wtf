import logging
import time

from eips.db import get_db_conn
from eips.worker.extract import process_extraction

logging.basicConfig(level=logging.INFO)


def _run():
    db_conn = get_db_conn()
    process_extraction(db_conn)
    db_conn.close()


def main():
    while True:
        _run()
        time.sleep(60 * 60)


if __name__ == "__main__":
    main()
