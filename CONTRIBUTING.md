# Contributing

Thanks for helping keep this the most accurate index of **LLM-for-science
benchmarks**. Contributing is intentionally simple: **you only ever edit one
file — [`data/benchmarks.yaml`](data/benchmarks.yaml).**

Everything else (the README tables, the website data, example rows) is generated
from that file automatically. Do **not** edit `README.md`,
`web/data/benchmarks.json` (git-ignored), or `data/examples.json` by hand.

## How to add or fix a benchmark

1. Fork and clone the repo.
2. Add (or edit) one entry in `data/benchmarks.yaml`.
3. *(Optional)* validate locally — no dependencies beyond PyYAML:
   ```bash
   pip install pyyaml
   python scripts/generate_readme.py --check
   ```
4. Open a pull request that changes **only** `data/benchmarks.yaml`.

CI takes it from there: a PR check validates the entry, and once merged a bot
regenerates the README and refreshes dataset example rows.

## Entry schema

```yaml
- name: "GPQA"                       # required · unique short name
  domain: "General"                  # required · one of the domains below
  subdomain: "graduate-QA"           # required · free-text tag
  paper_title: "GPQA: A Graduate-Level Google-Proof Q&A Benchmark"  # required
  arxiv_id: "2311.12022"             # arXiv id, or null
  paper_url: "https://arxiv.org/abs/2311.12022"                     # required
  github: "idavidrein/gpqa"          # "owner/repo", or null
  org: "NYU / Anthropic / Cohere"    # required · releasing organization
  major_lab: true                    # required · true only for OpenAI/Google
                                     #   DeepMind/Anthropic/Meta/Microsoft/
                                     #   Apple/Nvidia/xAI/Mistral
  year: 2023                         # required
  description: "448 expert-written graduate-level questions in bio, physics, chem."  # required · one sentence

  # --- optional dataset / eval fields (shown on the website) ---
  hf_dataset: "Idavidrein/gpqa"      # HuggingFace "owner/name", or omit
  license: "CC-BY-4.0"               # SPDX-ish string
  size: 448                          # number of eval items
  access: "gated"                    # open | gated | request | api-key
  task_type: "MCQ"                   # MCQ | open-ended | proof | code-gen |
                                     #   agentic | VQA | QA | generation
  metrics: ["accuracy"]              # list of metric names
  modality: "text"                   # text | multimodal | code
  leaderboard_url: "..."             # official leaderboard, or omit
  homepage_url: "..."                # official site, or omit
```

**Domains:** `General` · `Math` · `Physics` · `Chemistry` · `Materials` ·
`Biology` · `Agentic`. Put a cross-domain benchmark (e.g. one spanning bio +
physics + chemistry) under `General`.

## What we include (inclusion bar)

To stay useful and credible, an entry must be **both**:

1. **In scope** — a *benchmark / eval* whose primary purpose is measuring LLMs on
   natural or formal **science** (biology, chemistry, physics, mathematics,
   materials, astronomy, earth science) **or** scientific research workflows
   (discovery, scientific coding, literature analysis, agentic research).
   - Out of scope: pre-trained models or training datasets (not benchmarks),
     general-knowledge exams, pure clinical-trivia medical QA, general
     software-engineering or web agents, factuality/safety benchmarks.
2. **Legitimate** — at least one of:
   - accepted at a peer-reviewed venue (NeurIPS/ICML/ICLR/ACL/EMNLP/Nature/…), **or**
   - **≥ 40 citations**, **or**
   - from a **major AI lab or a well-known institution** (top university, national
     lab, established research group).

Please verify the paper resolves and the GitHub repo exists before submitting —
we never add unverified papers or fabricated dataset ids. Benchmarks that live in
a shared multi-eval monorepo should use `github: null` (the star count would
otherwise misrepresent the single benchmark).

## Ordering & style

Rows are listed **alphabetically** within each domain and there is no ranking —
so nothing to argue about. The README is regenerated automatically; don't touch
its formatting.
