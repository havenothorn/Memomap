import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";
import type { MarkerCategory } from "../types/map.ts";
import { CATEGORY_META } from "../types/map.ts";
import { ResultList } from "./ResultList";

export const SearchOverlay = () => {
  const map = useMap();
  const placesLib = useMapsLibrary("places");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<google.maps.places.PlaceResult>>(
    []
  );
  const serviceRef = useRef<google.maps.places.PlacesService | null>(null);
  const [open, setOpen] = useState(true);
  const [selectedCats, setSelectedCats] = useState<MarkerCategory[]>(["위시"]);

  useEffect(() => {
    if (map && placesLib && !serviceRef.current) {
      serviceRef.current = new google.maps.places.PlacesService(map);
    }
  }, [map, placesLib]);

  const doSearch = () => {
    if (!serviceRef.current || !query) return;
    const bounds = map?.getBounds?.();
    serviceRef.current.textSearch(
      {
        query,
        bounds: bounds ?? undefined,
      },
      (res, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && res) {
          setResults(res.slice(0, 8));
        } else {
          setResults([]);
        }
      }
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 72,
        left: 16,
        right: 16,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxWidth: 560,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          background: "#fff",
          borderRadius: 8,
          padding: 8,
          boxShadow: "0 2px 8px #0002",
        }}
      >
        <input
          placeholder="장소를 검색하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") doSearch();
          }}
          style={{
            flex: 1,
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            padding: 10,
            outline: "none",
          }}
        />
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {(Object.keys(CATEGORY_META) as MarkerCategory[]).map((cat) => (
            <label
              key={cat}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={selectedCats.includes(cat)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCats((prev) => [...prev, cat]);
                  } else {
                    setSelectedCats((prev) => prev.filter((c) => c !== cat));
                  }
                }}
                style={{ margin: 0 }}
              />
              <span style={{ fontSize: "12px" }}>
                {CATEGORY_META[cat].emoji}
              </span>
            </label>
          ))}
        </div>
        <button
          onClick={doSearch}
          style={{
            padding: "10px 12px",
            background: "none",
            border: "1px solid #e5e7eb",
            borderRadius: 6,
          }}
        >
          검색
        </button>
        <button
          onClick={() => setOpen((v) => !v)}
          title={open ? "검색 결과 숨기기" : "검색 결과 보이기"}
          style={{
            background: "none",
            border: 0,
          }}
        >
          {open ? "▲" : "▼"}
        </button>
      </div>

      {open && results.length > 0 && (
        <ResultList
          results={results}
          onPick={(r) => {
            const loc = r.geometry?.location;
            if (!loc) return;
            const position = { lat: loc.lat(), lng: loc.lng() };
            map?.panTo(position);
          }}
          onRegister={(r) => {
            const loc = r.geometry?.location;
            if (!loc) return;
            const position = { lat: loc.lat(), lng: loc.lng() };
            window.dispatchEvent(
              new CustomEvent("memomap:add-marker", {
                detail: {
                  position,
                  title: r.name ?? "제목 없음",
                  categories: selectedCats,
                },
              })
            );
            setResults([]);
          }}
        />
      )}
    </div>
  );
};
