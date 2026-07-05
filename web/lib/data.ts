import data from "@/data/benchmarks.json";

export type Example = Record<string, unknown>;

export interface Benchmark {
  slug: string;
  name: string;
  domain: string;
  subdomain: string | null;
  description: string;
  org: string | null;
  major_lab: boolean;
  year: number | null;
  paper_url: string | null;
  arxiv_id: string | null;
  github: string | null;
  topics: string[];
  hf_dataset: string | null;
  license: string | null;
  size: number | null;
  access: string | null;
  task_type: string | null;
  metrics: string[] | null;
  modality: string | null;
  leaderboard_url: string | null;
  homepage_url: string | null;
  examples: Example[];
}

export const benchmarks = data.benchmarks as Benchmark[];
export const domains = data.domains as string[];
export const count = data.count as number;

export function getBenchmark(slug: string): Benchmark | undefined {
  return benchmarks.find((b) => b.slug === slug);
}

export const DOMAIN_LABEL: Record<string, string> = {
  General: "General",
  Math: "Math",
  Physics: "Physics & Astro",
  Chemistry: "Chemistry",
  Materials: "Materials",
  Biology: "Biology",
  Agentic: "Agentic",
};

export const DOMAIN_ORDER = [
  "General",
  "Math",
  "Physics",
  "Chemistry",
  "Materials",
  "Biology",
  "Agentic",
];

// Muted, low-saturation dot per domain — aids scanning without being loud.
export const DOMAIN_DOT: Record<string, string> = {
  General: "#64748b",
  Math: "#6366f1",
  Physics: "#8b5cf6",
  Chemistry: "#0d9488",
  Materials: "#d97706",
  Biology: "#059669",
  Agentic: "#e05d44",
};
