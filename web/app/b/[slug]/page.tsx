import Link from "next/link";
import { notFound } from "next/navigation";
import { Access, TopicTags } from "@/components/Catalog";
import { benchmarks, getBenchmark, DOMAIN_LABEL, DOMAIN_DOT } from "@/lib/data";

export function generateStaticParams() {
  return benchmarks.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const b = getBenchmark(slug);
  if (!b) return {};
  return {
    title: `${b.name} — Scientific LLM Benchmarks`,
    description: b.description,
  };
}

export default async function BenchmarkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const b = getBenchmark(slug);
  if (!b) notFound();

  const hf = b.hf_dataset
    ? `https://huggingface.co/datasets/${b.hf_dataset}`
    : null;
  const gh = b.github ? `https://github.com/${b.github}` : null;

  return (
    <div className="mx-auto max-w-3xl px-5 pb-20">
      <div className="border-b border-border py-4">
        <Link
          href="/"
          className="text-sm text-muted underline-offset-2 hover:text-accent hover:underline"
        >
          ← All benchmarks
        </Link>
      </div>

      <header className="py-8">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: DOMAIN_DOT[b.domain] }}
          />
          {DOMAIN_LABEL[b.domain] ?? b.domain}
          {b.subdomain ? (
            <span className="text-faint normal-case tracking-normal">
              · {b.subdomain}
            </span>
          ) : null}
        </div>
        <h1 className="font-serif text-[40px] leading-[1.1] tracking-tight">
          {b.name}
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {b.org}
          {b.year ? ` · ${b.year}` : ""}
        </p>
        <p className="mt-4 text-[15px] leading-relaxed">{b.description}</p>
        {b.topics.length > 0 && (
          <div className="mt-4">
            <TopicTags topics={b.topics} />
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {b.paper_url && <LinkBtn href={b.paper_url}>Paper</LinkBtn>}
          {gh && <LinkBtn href={gh}>Code</LinkBtn>}
          {hf && <LinkBtn href={hf}>Dataset</LinkBtn>}
          {b.leaderboard_url && (
            <LinkBtn href={b.leaderboard_url}>Leaderboard</LinkBtn>
          )}
          {b.homepage_url && <LinkBtn href={b.homepage_url}>Homepage</LinkBtn>}
        </div>

        {gh && (
          <a href={gh} className="mt-4 inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="GitHub stars"
              className="h-5"
              src={`https://img.shields.io/github/stars/${b.github}?style=flat&label=stars&color=555&labelColor=333`}
            />
          </a>
        )}
      </header>

      <section className="grid grid-cols-2 gap-x-8 gap-y-5 border-y border-border py-6 sm:grid-cols-3">
        <Field label="Task type" value={b.task_type} />
        <Field label="Modality" value={b.modality} />
        <Field
          label="Access"
          value={b.access ? <Access value={b.access} /> : null}
        />
        <Field
          label="Size"
          value={b.size ? `${b.size.toLocaleString()} items` : null}
        />
        <Field label="License" value={b.license} />
        <Field
          label="Metrics"
          value={b.metrics?.length ? b.metrics.join(", ") : null}
        />
      </section>

      <section className="pt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Examples
          </h2>
          {hf && (
            <a
              href={hf}
              className="text-xs text-muted underline-offset-2 hover:text-accent hover:underline"
            >
              Browse full dataset ↗
            </a>
          )}
        </div>
        {b.examples.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
            <p className="text-sm text-muted">
              {b.access && b.access !== "open"
                ? `Samples are not shown — this dataset is ${b.access}.`
                : "No sample rows available for this dataset."}
            </p>
            {hf && (
              <a
                href={hf}
                className="mt-1.5 inline-block text-xs text-accent underline-offset-2 hover:underline"
              >
                Open it on Hugging Face ↗
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {b.examples.slice(0, 2).map((ex, i) => (
              <ExampleView key={i} ex={ex as Record<string, unknown>} />
            ))}
            <p className="font-mono text-[11px] text-faint">
              Real rows from the Hugging Face datasets server · long values
              truncated
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function renderVal(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "string") return v.length > 600 ? v.slice(0, 600) + " …" : v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v))
    return v
      .map((x) => (x && typeof x === "object" ? JSON.stringify(x) : String(x)))
      .join("\n");
  return JSON.stringify(v);
}

function ExampleView({ ex }: { ex: Record<string, unknown> }) {
  const entries = Object.entries(ex).filter(
    ([, v]) => v !== null && v !== "" && v !== undefined,
  );
  return (
    <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
      {entries.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[minmax(72px,120px)_1fr] gap-3 px-4 py-2.5">
          <div className="pt-0.5 font-mono text-[10px] uppercase tracking-wider text-faint">
            {k}
          </div>
          <div className="min-w-0 whitespace-pre-wrap break-words text-[13px] leading-relaxed">
            {renderVal(v)}
          </div>
        </div>
      ))}
    </div>
  );
}

function LinkBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
    >
      {children} <span className="text-faint">↗</span>
    </a>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-faint">
        {label}
      </dt>
      <dd className="mt-1 text-sm">
        {value ?? <span className="text-faint">—</span>}
      </dd>
    </div>
  );
}
