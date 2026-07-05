// Build the web's data file from the single source of truth (data/benchmarks.yaml)
// + the fetched example cache (data/examples.json). Runs as predev/prebuild so
// web/data/benchmarks.json is generated, never committed. No Python needed.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const here = path.dirname(fileURLToPath(import.meta.url));

function repoRoot(start) {
  let d = start;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(d, "data", "benchmarks.yaml"))) return d;
    d = path.dirname(d);
  }
  throw new Error("data/benchmarks.yaml not found walking up from " + start);
}

const ROOT = repoRoot(here);
const benchmarks = yaml.load(
  fs.readFileSync(path.join(ROOT, "data/benchmarks.yaml"), "utf8"),
);
const examplesPath = path.join(ROOT, "data/examples.json");
const examples = fs.existsSync(examplesPath)
  ? JSON.parse(fs.readFileSync(examplesPath, "utf8"))
  : {};

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Keyword stems -> science field (mirrors scripts derivation) for multi-field tags.
const FIELD_KEYWORDS = {
  Biology: ["biolog", "genom", "genetic", "protein", "bioinformatic", "gene ", "genes", "molecular biolog", "life scien", "single-cell", "scrna", "pathway", "cell type", "wet-lab", "wet lab"],
  Medicine: ["clinical", "medical", "biomedical", "disease", "health "],
  Chemistry: ["chemi", "chemical", "molecul", "reaction", "retrosynth", "compound"],
  Physics: ["physic", "quantum", "gravit", "condensed matter", "thermodynam", "mechanic", "particle", "relativ"],
  Astronomy: ["astronom", "astrophys", "cosmol", "celestial", "stellar", "binary-star", "gravitational physics"],
  Mathematics: ["mathemat", "theorem", "formaliz", "olympiad", "algebra", "geometr", "combinatori", "arithmetic", "calculus", "putnam"],
  Materials: ["material", "crystal", "atomic layer", "polymer"],
  "Earth Science": ["atmospher", "climate", "geoscien", "ocean", "hydrolog", "geophys", "weather"],
};
const DOMAIN_FIELD = {
  Math: "Mathematics", Physics: "Physics", Chemistry: "Chemistry",
  Materials: "Materials", Biology: "Biology",
};

function deriveTopics(b) {
  const text = ` ${b.name} ${b.subdomain ?? ""} ${b.description} `.toLowerCase();
  const found = [];
  const base = DOMAIN_FIELD[b.domain];
  if (base) found.push(base);
  for (const [field, stems] of Object.entries(FIELD_KEYWORDS)) {
    if (found.includes(field)) continue;
    if (stems.some((s) => text.includes(s))) found.push(field);
  }
  return found;
}

const ENRICH = ["hf_dataset", "license", "size", "access", "task_type", "metrics", "modality", "leaderboard_url", "homepage_url"];
const DOMAIN_ORDER = ["General", "Math", "Physics", "Chemistry", "Materials", "Biology", "Agentic"];

const seen = new Set();
const out = benchmarks.map((b) => {
  const slug = slugify(b.name);
  if (seen.has(slug)) console.warn(`! duplicate slug '${slug}' for ${b.name}`);
  seen.add(slug);
  const e = {
    slug,
    name: b.name,
    domain: b.domain,
    subdomain: b.subdomain ?? null,
    description: b.description,
    org: b.org ?? null,
    major_lab: Boolean(b.major_lab),
    year: b.year ?? null,
    paper_url: b.paper_url ?? null,
    arxiv_id: b.arxiv_id ?? null,
    github: b.github ?? null,
    topics: deriveTopics(b),
  };
  for (const f of ENRICH) e[f] = b[f] ?? null;
  e.examples = examples[b.name] ?? [];
  return e;
});

const order = Object.fromEntries(DOMAIN_ORDER.map((d, i) => [d, i]));
out.sort(
  (a, b) =>
    (order[a.domain] ?? 99) - (order[b.domain] ?? 99) ||
    a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
);

const payload = {
  count: out.length,
  domains: [...new Set(out.map((e) => e.domain))].sort(
    (a, b) => (order[a] ?? 99) - (order[b] ?? 99),
  ),
  benchmarks: out,
};

const outFile = path.join(here, "..", "data", "benchmarks.json");
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(payload, null, 2) + "\n");
const withEx = out.filter((e) => e.examples.length).length;
console.log(`gen-data: ${out.length} benchmarks (${withEx} with examples) -> web/data/benchmarks.json`);
