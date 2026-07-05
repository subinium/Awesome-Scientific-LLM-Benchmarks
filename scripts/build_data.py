#!/usr/bin/env python3
"""Build the web app's data file from the single source of truth.

Reads ``data/benchmarks.yaml`` (base metadata + optional enrichment fields) and,
if present, ``data/examples.json`` (real sample rows fetched from HuggingFace by
scripts/fetch_examples.py), then writes ``web/data/benchmarks.json`` consumed by
the Next.js site. No network calls.

Usage:
    python scripts/build_data.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "data" / "benchmarks.yaml"
EXAMPLES_FILE = ROOT / "data" / "examples.json"
OUT_FILE = ROOT / "web" / "data" / "benchmarks.json"

# Optional enrichment fields (scalars) that may appear on a benchmark entry.
ENRICH_FIELDS = [
    "hf_dataset",
    "license",
    "size",
    "access",
    "task_type",
    "metrics",
    "modality",
    "leaderboard_url",
    "homepage_url",
]


def slugify(name: str) -> str:
    s = name.lower().replace("&", " and ")
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


def main() -> int:
    benchmarks = yaml.safe_load(DATA_FILE.read_text(encoding="utf-8")) or []
    examples = {}
    if EXAMPLES_FILE.exists():
        examples = json.loads(EXAMPLES_FILE.read_text(encoding="utf-8"))

    slugs: set[str] = set()
    out: list[dict[str, Any]] = []
    for b in benchmarks:
        slug = slugify(b["name"])
        if slug in slugs:
            print(f"! duplicate slug '{slug}' for {b['name']}", file=sys.stderr)
        slugs.add(slug)
        entry: dict[str, Any] = {
            "slug": slug,
            "name": b["name"],
            "domain": b["domain"],
            "subdomain": b.get("subdomain"),
            "description": b["description"],
            "org": b.get("org"),
            "major_lab": bool(b.get("major_lab")),
            "year": b.get("year"),
            "paper_url": b.get("paper_url"),
            "arxiv_id": b.get("arxiv_id"),
            "github": b.get("github"),
        }
        for f in ENRICH_FIELDS:
            entry[f] = b.get(f)
        entry["examples"] = examples.get(b["name"], [])
        out.append(entry)

    # Sort by domain (fixed order) then name for a stable file.
    dom_order = {
        d: i
        for i, d in enumerate(
            [
                "General",
                "Math",
                "Physics",
                "Chemistry",
                "Materials",
                "Biology",
                "Agentic",
            ]
        )
    }
    out.sort(key=lambda e: (dom_order.get(e["domain"], 99), e["name"].lower()))

    payload = {
        "count": len(out),
        "domains": sorted(
            {e["domain"] for e in out}, key=lambda d: dom_order.get(d, 99)
        ),
        "benchmarks": out,
    }
    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    with_hf = sum(1 for e in out if e.get("hf_dataset"))
    with_ex = sum(1 for e in out if e.get("examples"))
    print(
        f"Wrote {OUT_FILE.relative_to(ROOT)} — {len(out)} benchmarks "
        f"({with_hf} with HF dataset, {with_ex} with examples)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
