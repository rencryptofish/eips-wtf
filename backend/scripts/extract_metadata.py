import logging
import time

from eips.db import get_db_conn
from eips.worker.extract import process_extraction

logger = logging.getLogger(__name__)

logging.basicConfig(level=logging.INFO)


def _run():
    db_conn = get_db_conn()
    process_extraction(db_conn)
    db_conn.close()


def main():
    while True:
        _run()
        logger.info("Sleeping for 4 hours")
        time.sleep(60 * 60 * 4)


if __name__ == "__main__":
    main()
