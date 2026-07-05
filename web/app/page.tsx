import { Catalog } from "@/components/Catalog";
import { benchmarks } from "@/lib/data";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Awesome Scientific LLM Benchmarks
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          A searchable database of benchmarks for evaluating large language
          models on scientific reasoning and discovery — across mathematics,
          physics &amp; astronomy, chemistry, materials science, biology, and
          agentic science. Each entry links its paper, code, dataset, and
          example items.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
          <a
            href="https://github.com/subinium/Awesome-Scientific-LLM-Benchmarks"
            className="hover:text-accent"
          >
            GitHub ↗
          </a>
          <span>{benchmarks.length} benchmarks</span>
          <span>Curated, accuracy-first</span>
        </div>
      </header>

      <Catalog benchmarks={benchmarks} />

      <footer className="mt-16 border-t border-border pt-6 text-xs text-muted">
        Data from{" "}
        <a
          href="https://github.com/subinium/Awesome-Scientific-LLM-Benchmarks/blob/main/data/benchmarks.yaml"
          className="hover:text-accent"
        >
          benchmarks.yaml
        </a>
        . Contributions welcome.
      </footer>
    </main>
  );
}
