import { useEffect, useState } from "react";
import type { MarkerCategory } from "../types/map.ts";
import { CATEGORY_META } from "../types/map.ts";

export const BottomLeftPanel = () => {
  const [filters, setFilters] = useState<Record<
    MarkerCategory,
    boolean
  > | null>(null);

  useEffect(() => {
    const collect = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        filters: Record<MarkerCategory, boolean>;
      };
      setFilters(detail.filters);
    };
    window.addEventListener("memomap:state", collect as EventListener);
    window.dispatchEvent(new CustomEvent("memomap:request-state"));
    return () =>
      window.removeEventListener("memomap:state", collect as EventListener);
  }, []);

  const toggleFilter = (cat: MarkerCategory) => {
    window.dispatchEvent(
      new CustomEvent("memomap:toggle-filter", { detail: { cat } })
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        left: 16,
        bottom: 70,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxWidth: 360,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px #0002",
          padding: 10,
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(Object.keys(CATEGORY_META) as MarkerCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => toggleFilter(cat)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                borderRadius: 6,
                border: filters?.[cat]
                  ? `2px solid ${CATEGORY_META[cat].color}`
                  : "1px solid #e5e7eb",
                background: filters?.[cat] ? "#f8fafc" : "#fff",
                color: "#111827",
              }}
            >
              <span>{CATEGORY_META[cat].emoji}</span>
              <span>{CATEGORY_META[cat].label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
