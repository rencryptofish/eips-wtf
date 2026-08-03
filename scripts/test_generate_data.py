import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

from scripts.generate_data import (
    ERC_MIGRATION_COMMIT,
    ERC_REPOSITORY_CUTOVER,
    REPOSITORIES,
    build_last_call_proposals,
    build_monthly_activity,
    normalize_category,
    normalize_requires,
    parse_repository_activity,
    select_recent_activity,
)


class GenerateDataTests(unittest.TestCase):
    def test_normalizes_metadata(self):
        self.assertEqual(normalize_category({"type": "Meta"}), "Meta")
        self.assertEqual(normalize_category({"category": "Core"}), "Core")
        self.assertEqual(normalize_category({"category": "Something else"}), "Unknown")
        self.assertEqual(normalize_requires("1559, 2718"), [1559, 2718])

    def test_monthly_activity_excludes_the_partial_current_month(self):
        current_month = datetime.now(timezone.utc).strftime("%Y-%m")
        activity = [
            {
                "committed_datetime": "2025-01-12T00:00:00+00:00",
                "category": "Core",
                "author_email": "alice@example.com",
            },
            {
                "committed_datetime": "2025-01-18T00:00:00+00:00",
                "category": "Core",
                "author_email": "ALICE@example.com",
            },
            {
                "committed_datetime": "2024-12-31T18:30:00-05:30",
                "category": "ERC",
                "author_email": "bob@example.com",
            },
            {
                "committed_datetime": f"{current_month}-01T00:00:00+00:00",
                "category": "Core",
                "author_email": "current-month@example.com",
            },
        ]

        rows = build_monthly_activity(activity)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["month"], "2025-01-01")
        self.assertEqual(rows[0]["core"], 2)
        self.assertEqual(rows[0]["erc"], 1)
        self.assertEqual(rows[0]["contributors"], 2)
        self.assertEqual(rows[0]["core_contributors"], 1)
        self.assertEqual(rows[0]["erc_contributors"], 1)

    def test_recent_activity_keeps_a_feed_for_each_category(self):
        activity = [
            {
                "hexsha": f"sha-{index}",
                "eip": index,
                "category": "Core" if index < 60 else "ERC",
                "committed_datetime": f"2026-01-{(index % 28) + 1:02d}T00:00:00+00:00",
            }
            for index in range(120)
        ]

        selected = select_recent_activity(activity)
        self.assertEqual(sum(item["category"] == "Core" for item in selected), 50)
        self.assertEqual(sum(item["category"] == "ERC" for item in selected), 50)

    @patch("scripts.generate_data.run")
    def test_legacy_erc_history_uses_old_filenames_and_omits_migration(self, run_mock):
        record_separator = "\x1e"
        field_separator = "\x1f"
        run_mock.return_value = "".join(
            [
                f"{record_separator}legacy-sha{field_separator}2020-01-02T00:00:00Z"
                f"{field_separator}2020-01-01T00:00:00Z{field_separator}Alice"
                f"{field_separator}alice@example.com{field_separator}Update ERC-20\n"
                "EIPS/eip-20-token-standard.md\n",
                f"{record_separator}{ERC_MIGRATION_COMMIT}{field_separator}"
                f"2023-10-25T15:11:14Z{field_separator}2023-10-25T15:11:14Z"
                f"{field_separator}Migrator{field_separator}migration@example.com"
                f"{field_separator}complete erc move\nEIPS/eip-20.md\n",
            ]
        )
        proposals = {
            20: {
                "title": "Token Standard",
                "type": "Standards Track",
                "category": "ERC",
                "discussion": None,
            }
        }

        activity = parse_repository_activity(
            REPOSITORIES[0],
            Path("/unused"),
            proposals,
            allow_legacy_filenames=True,
            committed_before=ERC_REPOSITORY_CUTOVER,
            excluded_commits=frozenset({ERC_MIGRATION_COMMIT}),
        )

        self.assertEqual([item["hexsha"] for item in activity], ["legacy-sha"])
        self.assertEqual(activity[0]["eip"], 20)
        self.assertEqual(activity[0]["category"], "ERC")
        command = run_mock.call_args.args[0]
        self.assertIn(f"--before={ERC_REPOSITORY_CUTOVER}", command)

    def test_last_call_omits_expired_deadlines(self):
        proposals = {
            1: {
                "eip": 1,
                "status": "Last Call",
                "last_call_deadline": "2020-01-01",
            },
            2: {
                "eip": 2,
                "status": "Last Call",
                "last_call_deadline": "9999-01-01",
            },
            3: {
                "eip": 3,
                "status": "Draft",
                "last_call_deadline": "9999-01-01",
            },
        }

        self.assertEqual(
            [proposal["eip"] for proposal in build_last_call_proposals(proposals)],
            [2],
        )


if __name__ == "__main__":
    unittest.main()
