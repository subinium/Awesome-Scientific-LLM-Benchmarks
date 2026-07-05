"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  type Benchmark,
  DOMAIN_LABEL,
  DOMAIN_ORDER,
  DOMAIN_DOT,
} from "@/lib/data";

type View = "cards" | "table";
type Sort = "name" | "year" | "size";

function toggle(set: Set<string>, v: string): Set<string> {
  const next = new Set(set);
  next.has(v) ? next.delete(v) : next.add(v);
  return next;
}

function countBy(items: Benchmark[], key: (b: Benchmark) => string[]) {
  const c: Record<string, number> = {};
  for (const b of items) for (const v of key(b)) if (v) c[v] = (c[v] ?? 0) + 1;
  return c;
}

export function Catalog({ benchmarks }: { benchmarks: Benchmark[] }) {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Set<string>>(new Set());
  const [access, setAccess] = useState<Set<string>>(new Set());
  const [modality, setModality] = useState<Set<string>>(new Set());
  const [topics, setTopics] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<Sort>("name");
  const [view, setView] = useState<View>("cards");
  const [showFilters, setShowFilters] = useState(false);

  const domainCounts = useMemo(
    () => countBy(benchmarks, (b) => [b.domain]),
    [benchmarks],
  );
  const taskOpts = useMemo(
    () => countBy(benchmarks, (b) => (b.task_type ? [b.task_type] : [])),
    [benchmarks],
  );
  const accessOpts = useMemo(
    () => countBy(benchmarks, (b) => (b.access ? [b.access] : [])),
    [benchmarks],
  );
  const modalityOpts = useMemo(
    () => countBy(benchmarks, (b) => (b.modality ? [b.modality] : [])),
    [benchmarks],
  );
  const topicOpts = useMemo(() => countBy(benchmarks, (b) => b.topics), [
    benchmarks,
  ]);
  const maxDomain = Math.max(...Object.values(domainCounts));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = benchmarks.filter((b) => {
      if (domain && b.domain !== domain) return false;
      if (tasks.size && !(b.task_type && tasks.has(b.task_type))) return false;
      if (access.size && !(b.access && access.has(b.access))) return false;
      if (modality.size && !(b.modality && modality.has(b.modality)))
        return false;
      if (topics.size && !b.topics.some((t) => topics.has(t))) return false;
      if (!q) return true;
      return (
        b.name.toLowerCase().includes(q) ||
        (b.org ?? "").toLowerCase().includes(q) ||
        (b.subdomain ?? "").toLowerCase().includes(q) ||
        b.topics.join(" ").toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
      );
    });
    rows.sort((a, b) => {
      if (sort === "year") return (b.year ?? 0) - (a.year ?? 0);
      if (sort === "size") return (b.size ?? 0) - (a.size ?? 0);
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
    return rows;
  }, [benchmarks, query, domain, tasks, access, modality, topics, sort]);

  const active: { label: string; clear: () => void }[] = [];
  if (domain)
    active.push({ label: DOMAIN_LABEL[domain], clear: () => setDomain(null) });
  topics.forEach((t) =>
    active.push({ label: t, clear: () => setTopics(toggle(topics, t)) }),
  );
  tasks.forEach((t) =>
    active.push({ label: t, clear: () => setTasks(toggle(tasks, t)) }),
  );
  access.forEach((t) =>
    active.push({ label: t, clear: () => setAccess(toggle(access, t)) }),
  );
  modality.forEach((t) =>
    active.push({ label: t, clear: () => setModality(toggle(modality, t)) }),
  );

  function reset() {
    setDomain(null);
    setTasks(new Set());
    setAccess(new Set());
    setModality(new Set());
    setTopics(new Set());
    setQuery("");
  }

  return (
    <div>
      {/* ── Toolbar (search / sort / view) ── */}
      <div className="sticky top-[44px] z-20 -mx-5 border-b border-border bg-bg/90 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">
              ⌕
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 135 benchmarks…"
              className="w-full rounded-md border border-border bg-surface py-2 pl-8 pr-3 text-sm outline-none placeholder:text-faint focus:border-accent"
            />
          </div>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm lg:hidden ${
              active.length
                ? "border-accent text-text"
                : "border-border text-muted"
            }`}
          >
            Filters
            {active.length > 0 && (
              <span className="rounded-full bg-accent px-1.5 text-[10px] text-white">
                {active.length}
              </span>
            )}
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-md border border-border bg-surface px-2 py-2 text-xs outline-none focus:border-accent"
          >
            <option value="name">A–Z</option>
            <option value="year">Newest</option>
            <option value="size">Largest</option>
          </select>
          <div className="hidden overflow-hidden rounded-md border border-border text-xs sm:flex">
            {(["cards", "table"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-2.5 py-2 capitalize transition-colors ${
                  view === v
                    ? "bg-surface-2 font-medium text-text"
                    : "text-muted hover:text-text"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>
            <span className="font-medium text-text tnum">{filtered.length}</span>{" "}
            of {benchmarks.length}
          </span>
          {active.map((a, i) => (
            <button
              key={i}
              onClick={a.clear}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 hover:border-border-strong"
            >
              {a.label} <span className="text-faint">✕</span>
            </button>
          ))}
          {active.length > 0 && (
            <button
              onClick={reset}
              className="text-faint underline-offset-2 hover:text-accent hover:underline"
            >
              clear all
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 lg:grid lg:grid-cols-[220px_1fr] lg:gap-10">
        {/* ── Sidebar facets (collapsible on mobile) ── */}
        <aside
          className={`${showFilters ? "block" : "hidden"} mb-6 lg:mb-0 lg:block`}
        >
          <div className="lg:sticky lg:top-[128px] lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-1">
            <Section title="Domains">
              <FacetRow
                active={domain === null}
                onClick={() => setDomain(null)}
                label="All fields"
                count={benchmarks.length}
              />
              {DOMAIN_ORDER.filter((d) => domainCounts[d]).map((d) => (
                <FacetRow
                  key={d}
                  active={domain === d}
                  onClick={() => setDomain(domain === d ? null : d)}
                  label={DOMAIN_LABEL[d]}
                  count={domainCounts[d]}
                  dot={DOMAIN_DOT[d]}
                  bar={domainCounts[d] / maxDomain}
                />
              ))}
            </Section>
            <Facet title="Field" opts={topicOpts} sel={topics} onToggle={(v) => setTopics(toggle(topics, v))} />
            <Facet title="Task" opts={taskOpts} sel={tasks} onToggle={(v) => setTasks(toggle(tasks, v))} />
            <Facet title="Access" opts={accessOpts} sel={access} onToggle={(v) => setAccess(toggle(access, v))} />
            <Facet title="Modality" opts={modalityOpts} sel={modality} onToggle={(v) => setModality(toggle(modality, v))} />
          </div>
        </aside>

        {/* ── Results ── */}
        <div className="min-w-0">
          {filtered.length === 0 ? (
            <p className="py-24 text-center text-sm text-muted">
              No benchmarks match your filters.
            </p>
          ) : view === "table" ? (
            <Table rows={filtered} />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((b) => (
                <Card key={b.slug} b={b} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 first:mt-0">
      <h3 className="mb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-faint">
        {title}
      </h3>
      {children}
    </div>
  );
}

function FacetRow({
  active,
  onClick,
  label,
  count,
  dot,
  bar,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  dot?: string;
  bar?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors ${
        active ? "bg-surface-2 font-medium" : "hover:bg-surface-2"
      }`}
    >
      {dot && (
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} />
      )}
      <span className="flex-1 text-left">{label}</span>
      {bar !== undefined && (
        <span className="relative hidden h-1 w-8 overflow-hidden rounded-full bg-surface-2 lg:block">
          <span
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${bar * 100}%`, background: dot, opacity: 0.5 }}
          />
        </span>
      )}
      <span className="w-6 text-right font-mono text-[11px] text-faint tnum">
        {count}
      </span>
    </button>
  );
}

function Facet({
  title,
  opts,
  sel,
  onToggle,
}: {
  title: string;
  opts: Record<string, number>;
  sel: Set<string>;
  onToggle: (v: string) => void;
}) {
  const entries = Object.entries(opts).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return null;
  return (
    <Section title={title}>
      <div className="flex flex-wrap gap-1.5">
        {entries.map(([v, n]) => {
          const on = sel.has(v);
          return (
            <button
              key={v}
              onClick={() => onToggle(v)}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
                on
                  ? "border-accent bg-accent-soft text-text"
                  : "border-border text-muted hover:border-border-strong hover:text-text"
              }`}
            >
              {v} <span className="font-mono text-faint tnum">{n}</span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

const FIELD_TO_DOMAIN: Record<string, string> = {
  Mathematics: "Math",
  Physics: "Physics",
  Astronomy: "Physics",
  Chemistry: "Chemistry",
  Materials: "Materials",
  Biology: "Biology",
  Medicine: "Biology",
  "Earth Science": "Physics",
};

export function TopicTags({ topics }: { topics: string[] }) {
  if (!topics.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {topics.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[11px] text-muted"
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: DOMAIN_DOT[FIELD_TO_DOMAIN[t] ?? "General"] }}
          />
          {t}
        </span>
      ))}
    </div>
  );
}

function Card({ b }: { b: Benchmark }) {
  return (
    <Link
      href={`/b/${b.slug}`}
      className="group flex flex-col rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong hover:bg-surface-2"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium leading-tight group-hover:text-accent">
          {b.name}
        </span>
        <span className="shrink-0 font-mono text-xs text-faint tnum">
          {b.year ?? ""}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: DOMAIN_DOT[b.domain] }}
        />
        {DOMAIN_LABEL[b.domain]}
        {b.subdomain ? ` · ${b.subdomain}` : ""}
      </div>
      <p className="mt-2.5 line-clamp-2 flex-1 text-[13.5px] leading-snug text-muted">
        {b.description}
      </p>
      <div className="mt-3 min-h-[18px]">
        <TopicTags topics={b.topics} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border pt-3 text-xs text-muted">
        {b.org && <span className="truncate text-faint">{b.org}</span>}
        <span className="ml-auto flex items-center gap-x-3">
          {b.task_type && <span>{b.task_type}</span>}
          {b.size ? (
            <span className="font-mono text-faint tnum">
              {b.size.toLocaleString()}
            </span>
          ) : null}
          {b.access && <Access value={b.access} />}
          {b.hf_dataset && (
            <span className="rounded border border-border px-1 font-mono text-[10px] text-faint">
              HF
            </span>
          )}
        </span>
      </div>
    </Link>
  );
}

function Table({ rows }: { rows: Benchmark[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left font-mono text-[10px] uppercase tracking-wider text-faint">
            <th className="py-2.5 pr-4 font-medium">Benchmark</th>
            <th className="hidden px-3 py-2.5 font-medium md:table-cell">Org</th>
            <th className="hidden px-3 py-2.5 font-medium lg:table-cell">Task</th>
            <th className="hidden px-3 py-2.5 text-right font-medium xl:table-cell">
              Size
            </th>
            <th className="hidden px-3 py-2.5 font-medium sm:table-cell">Access</th>
            <th className="px-3 py-2.5 text-right font-medium">Year</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr
              key={b.slug}
              className="group border-t border-border transition-colors hover:bg-surface-2"
            >
              <td className="py-3 pr-4 align-top">
                <div className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ background: DOMAIN_DOT[b.domain] }}
                  />
                  <div className="min-w-0">
                    <Link
                      href={`/b/${b.slug}`}
                      className="font-medium underline-offset-2 group-hover:text-accent group-hover:underline"
                    >
                      {b.name}
                    </Link>
                    <p className="mt-0.5 line-clamp-1 max-w-lg text-[13px] leading-snug text-muted">
                      {b.description}
                    </p>
                    <div className="mt-1">
                      <TopicTags topics={b.topics} />
                    </div>
                  </div>
                </div>
              </td>
              <td className="hidden whitespace-nowrap px-3 py-3 align-top text-sm text-muted md:table-cell">
                {b.org}
              </td>
              <td className="hidden px-3 py-3 align-top text-sm text-muted lg:table-cell">
                {b.task_type ?? "—"}
              </td>
              <td className="hidden px-3 py-3 text-right align-top font-mono text-sm text-muted tnum xl:table-cell">
                {b.size ? b.size.toLocaleString() : "—"}
              </td>
              <td className="hidden px-3 py-3 align-top sm:table-cell">
                <Access value={b.access} />
              </td>
              <td className="px-3 py-3 text-right align-top font-mono text-sm text-muted tnum">
                {b.year ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Access({ value }: { value: string | null }) {
  if (!value) return <span className="text-xs text-faint">—</span>;
  const dot =
    value === "open" ? "#16a34a" : value === "gated" ? "#d97706" : "#dc2626";
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />
      {value}
    </span>
  );
}
