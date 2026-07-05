<!-- Adding or fixing a benchmark? Edit ONLY data/benchmarks.yaml. -->

## What does this change?

<!-- e.g. "Add FrontierMath (Math)" or "Fix GPQA license" -->

## Checklist

- [ ] I edited **only** `data/benchmarks.yaml` (README / web data / examples are generated — don't touch them)
- [ ] The entry is a **benchmark/eval** (not a model or training dataset) for **science**
- [ ] It meets the [inclusion bar](../blob/main/CONTRIBUTING.md#what-we-include-inclusion-bar): peer-reviewed venue **or** ≥40 citations **or** a well-known institution
- [ ] I verified the **paper resolves** and the **GitHub repo exists** (or set `github: null`)
- [ ] `python scripts/generate_readme.py --check` passes locally *(optional — CI also checks)*
