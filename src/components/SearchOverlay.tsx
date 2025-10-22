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
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [pendingPlace, setPendingPlace] =
    useState<google.maps.places.PlaceResult | null>(null);

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
          setResults(res.slice(0, 10));
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
            setPendingPlace(r);
            setShowCategoryModal(true);
          }}
        />
      )}

      {/* 카테고리 선택 모달 */}
      {showCategoryModal && pendingPlace && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => {
            setShowCategoryModal(false);
            setPendingPlace(null);
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              maxWidth: 400,
              width: "90%",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: "0 0 16px 0",
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              카테고리 선택
            </h3>
            <p
              style={{
                margin: "0 0 20px 0",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              "{pendingPlace.name}"을(를) 어떤 카테고리에 추가하시겠습니까?
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(Object.keys(CATEGORY_META) as MarkerCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    const loc = pendingPlace.geometry?.location;
                    if (!loc) return;
                    const position = { lat: loc.lat(), lng: loc.lng() };
                    window.dispatchEvent(
                      new CustomEvent("memomap:add-marker", {
                        detail: {
                          position,
                          title: pendingPlace.name ?? "제목 없음",
                          categories: [cat],
                        },
                      })
                    );
                    setShowCategoryModal(false);
                    setPendingPlace(null);
                    setResults([]);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f3f4f6";
                    e.currentTarget.style.borderColor = "#d1d5db";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f9fafb";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }}
                >
                  <span style={{ fontSize: "20px" }}>
                    {CATEGORY_META[cat].emoji}
                  </span>
                  <span>{cat}</span>
                </button>
              ))}
            </div>

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setPendingPlace(null);
                }}
                style={{
                  padding: "8px 16px",
                  background: "#6b7280",
                  color: "#fff",
                  border: 0,
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
