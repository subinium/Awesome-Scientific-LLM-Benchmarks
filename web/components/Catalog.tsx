"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type Benchmark, DOMAIN_LABEL } from "@/lib/data";

const DOMAIN_ORDER = [
  "General",
  "Math",
  "Physics",
  "Chemistry",
  "Materials",
  "Biology",
  "Agentic",
];

export function Catalog({ benchmarks }: { benchmarks: Benchmark[] }) {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<string | null>(null);
  const [openOnly, setOpenOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return benchmarks.filter((b) => {
      if (domain && b.domain !== domain) return false;
      if (openOnly && b.access !== "open") return false;
      if (!q) return true;
      return (
        b.name.toLowerCase().includes(q) ||
        (b.org ?? "").toLowerCase().includes(q) ||
        (b.subdomain ?? "").toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
      );
    });
  }, [benchmarks, query, domain, openOnly]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const b of benchmarks) c[b.domain] = (c[b.domain] ?? 0) + 1;
    return c;
  }, [benchmarks]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search benchmarks, orgs, topics…"
          className="w-full rounded-lg border border-border bg-panel px-3.5 py-2.5 text-sm outline-none placeholder:text-muted focus:border-accent sm:max-w-sm"
        />
        <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={openOnly}
            onChange={(e) => setOpenOnly(e.target.checked)}
            className="accent-accent"
          />
          Open datasets only
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Chip active={domain === null} onClick={() => setDomain(null)}>
          All <span className="text-muted">{benchmarks.length}</span>
        </Chip>
        {DOMAIN_ORDER.filter((d) => counts[d]).map((d) => (
          <Chip key={d} active={domain === d} onClick={() => setDomain(d)}>
            {DOMAIN_LABEL[d] ?? d} <span className="text-muted">{counts[d]}</span>
          </Chip>
        ))}
      </div>

      <p className="mt-5 text-xs text-muted">
        {filtered.length} of {benchmarks.length} benchmarks
      </p>

      <div className="mt-2 overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Benchmark</th>
              <th className="px-3 py-3 font-medium">Domain</th>
              <th className="hidden px-3 py-3 font-medium md:table-cell">Org</th>
              <th className="hidden px-3 py-3 font-medium lg:table-cell">Task</th>
              <th className="hidden px-3 py-3 font-medium sm:table-cell">Access</th>
              <th className="px-3 py-3 font-medium">Year</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr
                key={b.slug}
                className="border-b border-border/60 last:border-0 hover:bg-panel"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/b/${b.slug}`}
                    className="font-medium hover:text-accent"
                  >
                    {b.name}
                  </Link>
                  <div className="mt-0.5 line-clamp-1 max-w-md text-xs text-muted">
                    {b.description}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className="whitespace-nowrap rounded-md border border-border px-2 py-0.5 text-xs text-muted">
                    {DOMAIN_LABEL[b.domain] ?? b.domain}
                  </span>
                </td>
                <td className="hidden px-3 py-3 text-muted md:table-cell">
                  {b.org}
                </td>
                <td className="hidden px-3 py-3 text-muted lg:table-cell">
                  {b.task_type ?? "—"}
                </td>
                <td className="hidden px-3 py-3 sm:table-cell">
                  <Access value={b.access} />
                </td>
                <td className="px-3 py-3 text-muted">{b.year ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        active
          ? "border-accent bg-accent/15 text-text"
          : "border-border text-muted hover:border-muted"
      }`}
    >
      {children}
    </button>
  );
}

export function Access({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted">—</span>;
  const color =
    value === "open"
      ? "text-emerald-400"
      : value === "gated"
        ? "text-amber-400"
        : "text-rose-400";
  return <span className={`text-xs ${color}`}>{value}</span>;
}
