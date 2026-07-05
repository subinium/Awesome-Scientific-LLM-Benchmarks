import { Catalog } from "@/components/Catalog";
import {
  benchmarks,
  domains,
  DOMAIN_ORDER,
  DOMAIN_LABEL,
  DOMAIN_DOT,
} from "@/lib/data";

export default function Home() {
  const withData = benchmarks.filter((b) => b.hf_dataset).length;
  const withCode = benchmarks.filter((b) => b.github).length;
  const counts: Record<string, number> = {};
  for (const b of benchmarks) counts[b.domain] = (counts[b.domain] ?? 0) + 1;
  const present = DOMAIN_ORDER.filter((d) => counts[d]);

  return (
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
      <header className="border-b border-border py-12 sm:py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          A curated, accuracy-first index
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.08] tracking-tight sm:text-[52px]">
          Benchmarks for evaluating LLMs on scientific reasoning &amp; discovery
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted">
          A curated, searchable collection of benchmarks across the natural
          sciences and agentic research. Each entry includes its paper, code,
          dataset, and sample items, checked against the original source.
        </p>

        {/* Signature overview: the whole collection at a glance */}
        <div className="mt-9">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full">
            {present.map((d) => (
              <div
                key={d}
                title={`${DOMAIN_LABEL[d]} · ${counts[d]}`}
                style={{
                  width: `${(counts[d] / benchmarks.length) * 100}%`,
                  background: DOMAIN_DOT[d],
                }}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
            {present.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1.5 text-xs text-muted"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: DOMAIN_DOT[d] }}
                />
                {DOMAIN_LABEL[d]}
                <span className="font-mono text-faint tnum">{counts[d]}</span>
              </span>
            ))}
          </div>
        </div>

        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3">
          <Stat n={benchmarks.length} label="benchmarks" />
          <Stat n={domains.length} label="domains" />
          <Stat n={withData} label="with datasets" />
          <Stat n={withCode} label="with code" />
        </dl>
      </header>

      <main className="py-8 pb-24">
        <Catalog benchmarks={benchmarks} />
      </main>

      <footer className="flex flex-col gap-2 border-t border-border py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Open source. Every entry is verified — nothing hand-entered.{" "}
          <a
            href="https://github.com/subinium/Awesome-Scientific-LLM-Benchmarks"
            className="text-text underline decoration-border underline-offset-2 hover:text-accent hover:decoration-accent"
          >
            Add a benchmark →
          </a>
        </p>
        <p className="font-mono text-[11px] text-faint">
          {benchmarks.length} benchmarks · updated continuously
        </p>
      </footer>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="font-mono text-2xl tabular-nums">{n}</dt>
      <dd className="text-sm text-muted">{label}</dd>
    </div>
  );
}
