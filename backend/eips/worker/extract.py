"""
Extract useful metadata from the EIPs repo
"""

import logging
from typing import List, Type

from playhouse.pool import PooledPostgresqlExtDatabase

from eips.eip_repo import BaseEIPRepo, EIPCoreRepo, EIPERCRepo
from eips.schemas import EIP, EIPCommit

logger = logging.getLogger(__name__)


def _insert_eips(db_conn, eips: List[EIP]) -> None:
    logger.info("Inserting EIPs...")
    with db_conn.cursor() as cursor:
        for eip in eips:
            cursor.execute(
                """
                INSERT INTO eips (
                    eip,
                    title,
                    author,
                    status,
                    type,
                    discussion,
                    discussion_count,
                    category,
                    created,
                    requires,
                    last_call_deadline,
                    content
                ) VALUES (
                    %(eip)s,
                    %(title)s,
                    %(author)s,
                    %(status)s,
                    %(type)s,
                    %(discussion)s,
                    %(discussion_count)s,
                    %(category)s,
                    %(created)s,
                    %(requires)s,
                    %(last_call_deadline)s,
                    %(content)s
                )
                ON CONFLICT (eip) DO UPDATE SET
                    title = %(title)s,
                    author = %(author)s,
                    status = %(status)s,
                    type = %(type)s,
                    discussion = %(discussion)s,
                    discussion_count = %(discussion_count)s,
                    category = %(category)s,
                    created = %(created)s,
                    requires = %(requires)s,
                    last_call_deadline = %(last_call_deadline)s,
                    content = %(content)s
                """,
                eip.dict(),
            )
        db_conn.commit()


def _insert_commits(db_conn, commits: List[EIPCommit]) -> None:
    logger.info("Inserting commits...")
    with db_conn.cursor() as cursor:
        for commit in commits:
            cursor.execute(
                """
                INSERT INTO commits (
                    hexsha,
                    committed_datetime,
                    authored_datetime,
                    message,
                    author_email,
                    author_name
                ) VALUES (
                    %(hexsha)s,
                    %(committed_datetime)s,
                    %(authored_datetime)s,
                    %(message)s,
                    %(author_email)s,
                    %(author_name)s
                )
                ON CONFLICT (hexsha) DO UPDATE SET
                    committed_datetime = %(committed_datetime)s,
                    authored_datetime = %(authored_datetime)s,
                    message = %(message)s,
                    author_email = %(author_email)s,
                    author_name = %(author_name)s
                """,
                commit.dict(),
            )
            for eip_diff in commit.eip_diffs:
                cursor.execute(
                    """
                    INSERT INTO eip_diffs (
                        hexsha,
                        eip
                    ) VALUES (
                        %(hexsha)s,
                        %(eip)s
                    )
                    ON CONFLICT (hexsha, eip) DO NOTHING
                    """,
                    eip_diff.dict(),
                )
        db_conn.commit()


def process_repo(db_conn: PooledPostgresqlExtDatabase, eip_repo: Type[BaseEIPRepo]):
    logger.info(f"Processing {eip_repo.git_url}...")
    eip_repo.checkout_repo()
    eips = eip_repo.extract_eips()
    commits = eip_repo.extract_eip_commits()
    _insert_eips(db_conn, eips)
    _insert_commits(db_conn, commits)
    eip_repo.delete_repo()


def process_extraction(db_conn: PooledPostgresqlExtDatabase):
    process_repo(
        db_conn, EIPCoreRepo("https://github.com/ethereum/EIPs.git", "EIPS", "eip")
    )
    process_repo(
        db_conn, EIPERCRepo("https://github.com/ethereum/ERCs.git", "ERCS", "erc")
    )
