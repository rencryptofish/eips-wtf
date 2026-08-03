#!/usr/bin/env python3
"""Build the static eips.wtf dataset from the public EIPs and ERCs repositories."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import tempfile
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, Iterable

import frontmatter

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "frontend" / "data" / "eips.json"
RECENT_CHANGES_PER_CATEGORY = 50
ERC_MIGRATION_COMMIT = "8dd085d159cb123f545c272c0d871a5339550e79"
ERC_REPOSITORY_CUTOVER = "2023-10-25T15:11:14Z"
CATEGORY_SLUGS = (
    "core",
    "networking",
    "interface",
    "erc",
    "meta",
    "informational",
    "unknown",
)


@dataclass(frozen=True)
class RepositoryConfig:
    name: str
    url: str
    proposal_directory: str
    filename_prefix: str


REPOSITORIES = (
    RepositoryConfig(
        name="EIPs",
        url="https://github.com/ethereum/EIPs.git",
        proposal_directory="EIPS",
        filename_prefix="eip",
    ),
    RepositoryConfig(
        name="ERCs",
        url="https://github.com/ethereum/ERCs.git",
        proposal_directory="ERCS",
        filename_prefix="erc",
    ),
)


def run(command: list[str], *, cwd: Path | None = None) -> str:
    result = subprocess.run(
        command,
        cwd=cwd,
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout


def clone_repository(config: RepositoryConfig, workspace: Path) -> Path:
    destination = workspace / config.name
    print(f"Cloning {config.url}…", flush=True)
    run(
        [
            "git",
            "clone",
            "--filter=blob:none",
            "--no-tags",
            "--single-branch",
            config.url,
            str(destination),
        ]
    )
    return destination


def normalize_category(metadata: dict[str, Any]) -> str:
    proposal_type = str(metadata.get("type") or "").strip()
    if proposal_type in {"Meta", "Informational"}:
        return proposal_type

    category = str(metadata.get("category") or "Unknown").strip()
    return category if category.lower() in CATEGORY_SLUGS else "Unknown"


def normalize_requires(value: Any) -> list[int]:
    if value in (None, ""):
        return []
    if isinstance(value, int):
        return [value]
    if isinstance(value, str):
        return [
            int(item.strip()) for item in value.split(",") if item.strip().isdigit()
        ]
    if isinstance(value, Iterable):
        return [int(item) for item in value if str(item).strip().isdigit()]
    return []


def serialize_date(value: Any) -> str | None:
    if value in (None, ""):
        return None
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return str(value)


def parse_git_datetime(value: str) -> datetime:
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def parse_proposals(
    config: RepositoryConfig,
    repository_path: Path,
) -> dict[int, dict[str, Any]]:
    proposals: dict[int, dict[str, Any]] = {}
    proposal_paths = sorted(
        (repository_path / config.proposal_directory).glob(
            f"{config.filename_prefix}-*.md"
        )
    )

    for proposal_path in proposal_paths:
        post = frontmatter.load(proposal_path)
        metadata = post.metadata
        proposal_number = metadata.get("eip")
        if not isinstance(proposal_number, int):
            continue

        category = normalize_category(metadata)
        if config.name == "EIPs" and category == "ERC":
            continue
        if config.name == "ERCs" and category != "ERC":
            continue

        proposals[proposal_number] = {
            "eip": proposal_number,
            "title": str(metadata.get("title") or f"EIP-{proposal_number}"),
            "author": str(metadata.get("author") or "Unknown"),
            "status": str(metadata.get("status") or "Unknown"),
            "type": str(metadata.get("type") or "Unknown"),
            "category": category,
            "created": serialize_date(metadata.get("created")),
            "requires": normalize_requires(metadata.get("requires")),
            "last_call_deadline": serialize_date(metadata.get("last-call-deadline")),
            "discussion": metadata.get("discussions-to"),
            "repository": config.name,
        }

    print(f"Parsed {len(proposals):,} current proposals from {config.name}.")
    return proposals


def parse_repository_activity(
    config: RepositoryConfig,
    repository_path: Path,
    proposals: dict[int, dict[str, Any]],
    *,
    allow_legacy_filenames: bool = False,
    committed_before: str | None = None,
    excluded_commits: frozenset[str] = frozenset(),
) -> list[dict[str, Any]]:
    record_separator = "\x1e"
    field_separator = "\x1f"
    command = [
        "git",
        "log",
        "--date=iso-strict",
        "--diff-filter=AMR",
        f"--format={record_separator}%H{field_separator}%cI{field_separator}%aI"
        f"{field_separator}%an{field_separator}%ae{field_separator}%s",
        "--name-only",
    ]
    if committed_before:
        command.append(f"--before={committed_before}")
    command.extend(["--", config.proposal_directory])
    log_output = run(command, cwd=repository_path)
    optional_legacy_suffix = r"(?:-[^/]*)?" if allow_legacy_filenames else ""
    filename_pattern = re.compile(
        rf"(?:^|/){re.escape(config.filename_prefix)}-(\d+)"
        rf"{optional_legacy_suffix}\.md$"
    )
    activity: list[dict[str, Any]] = []

    for record in log_output.split(record_separator):
        lines = [line.strip() for line in record.splitlines() if line.strip()]
        if not lines:
            continue

        fields = lines[0].split(field_separator)
        if len(fields) != 6:
            continue

        hexsha, committed_at, authored_at, author_name, author_email, message = fields
        if hexsha in excluded_commits:
            continue

        changed_proposals: set[int] = set()
        for filename in lines[1:]:
            match = filename_pattern.search(filename)
            if match:
                changed_proposals.add(int(match.group(1)))

        for proposal_number in changed_proposals:
            proposal = proposals.get(proposal_number)
            if not proposal:
                continue
            activity.append(
                {
                    "hexsha": hexsha,
                    "eip": proposal_number,
                    "title": proposal["title"],
                    "committed_datetime": committed_at,
                    "authored_datetime": authored_at,
                    "message": message,
                    "author_email": author_email,
                    "author_name": author_name,
                    "type": proposal["type"],
                    "category": proposal["category"],
                    "discussion": proposal["discussion"],
                    "discussion_count": None,
                    "repository": config.name,
                }
            )

    print(f"Indexed {len(activity):,} proposal changes from {config.name} history.")
    return activity


def select_recent_activity(activity: list[dict[str, Any]]) -> list[dict[str, Any]]:
    activity.sort(
        key=lambda item: parse_git_datetime(item["committed_datetime"]), reverse=True
    )
    selected: dict[tuple[str, int], dict[str, Any]] = {}

    for category in ("all", *CATEGORY_SLUGS):
        matching = (
            activity
            if category == "all"
            else [
                item for item in activity if str(item["category"]).lower() == category
            ]
        )
        for item in matching[:RECENT_CHANGES_PER_CATEGORY]:
            selected[(item["hexsha"], item["eip"])] = item

    return sorted(
        selected.values(),
        key=lambda item: item["committed_datetime"],
        reverse=True,
    )


def build_monthly_activity(activity: list[dict[str, Any]]) -> list[dict[str, Any]]:
    counts: Counter[tuple[str, str]] = Counter()
    contributors: dict[tuple[str, str], set[str]] = {}
    current_month = datetime.now(timezone.utc).strftime("%Y-%m")

    for item in activity:
        month = parse_git_datetime(item["committed_datetime"]).strftime("%Y-%m")
        if month == current_month:
            continue
        category = str(item["category"]).lower()
        counts[(month, category)] += 1
        contributor = str(item.get("author_email") or item.get("author_name") or "")
        contributor = contributor.strip().casefold()
        if contributor:
            contributors.setdefault((month, "all"), set()).add(contributor)
            contributors.setdefault((month, category), set()).add(contributor)

    months = sorted({month for month, _category in counts})
    return [
        {
            "month": f"{month}-01",
            **{
                category: counts.get((month, category), 0)
                for category in CATEGORY_SLUGS
            },
            "contributors": len(contributors.get((month, "all"), set())),
            **{
                f"{category}_contributors": len(
                    contributors.get((month, category), set())
                )
                for category in CATEGORY_SLUGS
            },
        }
        for month in months
    ]


def build_last_call_proposals(
    proposals: dict[int, dict[str, Any]],
) -> list[dict[str, Any]]:
    today = datetime.now(timezone.utc).date().isoformat()
    last_call = [
        proposal
        for proposal in proposals.values()
        if proposal["status"].lower() == "last call"
        and (
            not proposal["last_call_deadline"]
            or proposal["last_call_deadline"][:10] >= today
        )
    ]
    return sorted(
        last_call,
        key=lambda proposal: proposal["last_call_deadline"] or "9999-12-31",
    )


def build_snapshot(workspace: Path) -> dict[str, Any]:
    with ThreadPoolExecutor(max_workers=len(REPOSITORIES)) as executor:
        repository_paths = dict(
            zip(
                REPOSITORIES,
                executor.map(
                    lambda config: clone_repository(config, workspace), REPOSITORIES
                ),
            )
        )

    all_proposals: dict[int, dict[str, Any]] = {}
    all_activity: list[dict[str, Any]] = []
    proposals_by_repository: dict[str, dict[int, dict[str, Any]]] = {}
    source_revisions: dict[str, str] = {}

    for config, repository_path in repository_paths.items():
        proposals = parse_proposals(config, repository_path)
        all_proposals.update(proposals)
        proposals_by_repository[config.name] = proposals
        exclusions = (
            frozenset({ERC_MIGRATION_COMMIT}) if config.name == "ERCs" else frozenset()
        )
        all_activity.extend(
            parse_repository_activity(
                config,
                repository_path,
                proposals,
                excluded_commits=exclusions,
            )
        )
        source_revisions[config.name] = run(
            ["git", "rev-parse", "HEAD"], cwd=repository_path
        ).strip()

    eips_config = next(config for config in REPOSITORIES if config.name == "EIPs")
    all_activity.extend(
        parse_repository_activity(
            eips_config,
            repository_paths[eips_config],
            proposals_by_repository["ERCs"],
            allow_legacy_filenames=True,
            committed_before=ERC_REPOSITORY_CUTOVER,
        )
    )

    if len(all_proposals) < 500 or not all_activity:
        raise RuntimeError(
            "Generated dataset failed its sanity check; refusing to write an empty snapshot."
        )

    return {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sources": source_revisions,
        "eipDiffs": select_recent_activity(all_activity),
        "eipDiffsPerMonth": build_monthly_activity(all_activity),
        "lastCallEIPs": build_last_call_proposals(all_proposals),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"Snapshot path (default: {DEFAULT_OUTPUT})",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    with tempfile.TemporaryDirectory(prefix="eips-wtf-") as temporary_directory:
        snapshot = build_snapshot(Path(temporary_directory))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(
        f"Wrote {args.output} with {len(snapshot['eipDiffs']):,} recent changes, "
        f"{len(snapshot['eipDiffsPerMonth']):,} months, and "
        f"{len(snapshot['lastCallEIPs']):,} Last Call proposals."
    )


if __name__ == "__main__":
    main()
