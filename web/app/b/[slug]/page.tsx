import Link from "next/link";
import { notFound } from "next/navigation";
import { Access } from "@/components/Catalog";
import { benchmarks, getBenchmark, DOMAIN_LABEL } from "@/lib/data";

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
  return { title: `${b.name} — Scientific LLM Benchmarks`, description: b.description };
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
    <main className="mx-auto max-w-3xl px-5 py-12">
      <Link href="/" className="text-xs text-muted hover:text-accent">
        ← All benchmarks
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{b.name}</h1>
          <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted">
            {DOMAIN_LABEL[b.domain] ?? b.domain}
            {b.subdomain ? ` · ${b.subdomain}` : ""}
          </span>
        </div>
        <p className="mt-3 leading-relaxed text-muted">{b.description}</p>
        <div className="mt-3 text-sm text-muted">
          {b.org}
          {b.year ? ` · ${b.year}` : ""}
        </div>
      </header>

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
        <img
          alt="GitHub stars"
          className="mt-4 h-5"
          src={`https://img.shields.io/github/stars/${b.github}?style=flat&logo=github&logoColor=white&label=stars&color=181717`}
        />
      )}

      <section className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-border p-5 sm:grid-cols-3">
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

      <section className="mt-8">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
          Examples
        </h2>
        {b.examples.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            No sample items yet.{" "}
            {hf ? (
              <a href={hf} className="hover:text-accent">
                Browse the dataset ↗
              </a>
            ) : null}
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {b.examples.slice(0, 3).map((ex, i) => (
              <pre
                key={i}
                className="overflow-x-auto rounded-lg border border-border bg-panel p-4 text-xs leading-relaxed text-text/90"
              >
                {JSON.stringify(ex, null, 2)}
              </pre>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function LinkBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-text"
    >
      {children} ↗
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
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-sm">{value ?? <span className="text-muted">—</span>}</div>
    </div>
  );
}
