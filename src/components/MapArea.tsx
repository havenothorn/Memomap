import {
  AdvancedMarker,
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";

type LatLngLiteral = google.maps.LatLngLiteral;

type AppMarker = {
  id: string;
  position: LatLngLiteral;
  title: string;
  categories: MarkerCategory[];
};

type MarkerCategory = "추억" | "위시" | "봄" | "여름" | "가을" | "겨울";

const CATEGORY_META: Record<
  MarkerCategory,
  { label: string; emoji: string; color: string; border: string; glyph: string }
> = {
  추억: {
    label: "추억",
    emoji: "📸",
    color: "#8b5cf6",
    border: "#5b21b6",
    glyph: "#ddd6fe",
  },
  위시: {
    label: "위시",
    emoji: "⭐",
    color: "#3b82f6",
    border: "#1e40af",
    glyph: "#bfdbfe",
  },
  봄: {
    label: "봄",
    emoji: "🌸",
    color: "#f472b6",
    border: "#9d174d",
    glyph: "#fbcfe8",
  },
  여름: {
    label: "여름",
    emoji: "🏖️",
    color: "#10b981",
    border: "#065f46",
    glyph: "#a7f3d0",
  },
  가을: {
    label: "가을",
    emoji: "🍁",
    color: "#f59e0b",
    border: "#b45309",
    glyph: "#fde68a",
  },
  겨울: {
    label: "겨울",
    emoji: "❄️",
    color: "#ffffffff",
    border: "#515151ff",
    glyph: "#d1f8ffff",
  },
};

export const MapArea = () => {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
        <Map
          mapId={import.meta.env.VITE_GOOGLE_MAPS_ID}
          style={{ width: "100%", height: "100%" }}
          defaultCenter={{ lat: 37.5665, lng: 126.978 }}
          defaultZoom={12}
          gestureHandling="greedy"
          disableDefaultUI
        >
          <InteractiveLayer />
        </Map>
        <SearchOverlay />
        <BottomLeftPanel />
      </div>
    </APIProvider>
  );
};

function SearchOverlay() {
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
        maxWidth: 520,
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
              <span>{CATEGORY_META[cat].emoji}</span>
            </label>
          ))}
        </div>
        <button
          onClick={doSearch}
          style={{
            padding: "10px 12px",
            borderRadius: 6,
            background: "#111827",
            color: "#fff",
            border: 0,
          }}
        >
          검색
        </button>
        <button
          onClick={() => setOpen((v) => !v)}
          title={open ? "검색 결과 숨기기" : "검색 결과 보이기"}
          style={{
            padding: "10px 12px",
            borderRadius: 6,
            background: "#e5e7eb",
            color: "#111827",
            border: 0,
          }}
        >
          {open ? "접기" : "펼치기"}
        </button>
        {/* Clear button removed as per request */}
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
}

function ResultList({
  results,
  onPick,
  onRegister,
}: {
  results: Array<google.maps.places.PlaceResult>;
  onPick: (r: google.maps.places.PlaceResult) => void;
  onRegister: (r: google.maps.places.PlaceResult) => void;
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px #0002",
        overflow: "visible",
      }}
    >
      {results.map((r, i) => (
        <div
          key={(r.place_id ?? "") + i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: 8,
            padding: 12,
            borderTop: i === 0 ? "none" : "1px solid #eee",
            background: "#fff",
          }}
        >
          <button
            onClick={() => onPick(r)}
            style={{
              flex: 1,
              minWidth: 0,
              textAlign: "left",
              background: "transparent",
              border: 0,
              cursor: "pointer",
            }}
          >
            <span style={{ fontWeight: 600 }}>{r.name}</span>
            {r.formatted_address && (
              <span
                style={{
                  color: "#6b7280",
                  marginLeft: 8,
                  display: "inline-block",
                  maxWidth: "60%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {r.formatted_address}
              </span>
            )}
          </button>
          <button
            onClick={() => onRegister(r)}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              background: "#111827",
              color: "#fff",
              border: 0,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
            title="이 장소를 마커로 등록"
          >
            등록
          </button>
        </div>
      ))}
    </div>
  );
}

function InteractiveLayer() {
  const map = useMap();
  const mapsLib = useMapsLibrary("maps");
  const [markers, setMarkers] = useState<AppMarker[]>([]);
  const [filters, setFilters] = useState<Record<MarkerCategory, boolean>>({
    추억: true,
    위시: true,
    봄: true,
    여름: true,
    가을: true,
    겨울: true,
  });
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // Load markers from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("memomap-markers");
      if (saved) {
        const parsed = JSON.parse(saved) as AppMarker[];
        setMarkers(parsed);
      }
    } catch (e) {
      console.warn("Failed to load markers from localStorage:", e);
    }
  }, []);

  // Save markers to localStorage whenever markers change
  useEffect(() => {
    if (markers.length > 0) {
      try {
        localStorage.setItem("memomap-markers", JSON.stringify(markers));
      } catch (e) {
        console.warn("Failed to save markers to localStorage:", e);
      }
    }
  }, [markers]);

  useEffect(() => {
    if (map && mapsLib && !infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow();
    }
  }, [map, mapsLib]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        position: LatLngLiteral;
        title: string;
        category?: MarkerCategory;
        categories?: MarkerCategory[];
      };
      const id = `${detail.position.lat},${detail.position.lng}-${Date.now()}`;
      setMarkers((prev) => [
        ...prev,
        {
          id,
          position: detail.position,
          title: detail.title,
          categories: detail.categories ?? [detail.category ?? "위시"],
        },
      ]);
    };
    window.addEventListener("memomap:add-marker", handler as EventListener);
    return () =>
      window.removeEventListener(
        "memomap:add-marker",
        handler as EventListener
      );
  }, []);

  // Expose state for BottomLeftPanel
  useEffect(() => {
    const request = () => {
      window.dispatchEvent(
        new CustomEvent("memomap:state", { detail: { markers, filters } })
      );
    };
    window.addEventListener("memomap:request-state", request);
    return () => window.removeEventListener("memomap:request-state", request);
  }, [markers, filters]);

  useEffect(() => {
    const toggle = (e: Event) => {
      const { cat } = (e as CustomEvent).detail as { cat: MarkerCategory };
      setFilters((prev) => ({ ...prev, [cat]: !prev[cat] }));
    };
    window.addEventListener("memomap:toggle-filter", toggle as EventListener);
    return () =>
      window.removeEventListener(
        "memomap:toggle-filter",
        toggle as EventListener
      );
  }, []);

  useEffect(() => {
    const remove = (e: Event) => {
      const { id } = (e as CustomEvent).detail as { id: string };
      setMarkers((prev) => prev.filter((m) => m.id !== id));
    };
    const update = (e: Event) => {
      const { id, title, category } = (e as CustomEvent).detail as {
        id: string;
        title: string;
        category: MarkerCategory;
      };
      setMarkers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, title, category } : m))
      );
    };
    window.addEventListener("memomap:remove-marker", remove as EventListener);
    window.addEventListener("memomap:update-marker", update as EventListener);
    return () => {
      window.removeEventListener(
        "memomap:remove-marker",
        remove as EventListener
      );
      window.removeEventListener(
        "memomap:update-marker",
        update as EventListener
      );
    };
  }, []);

  const openInfo = (
    marker: AppMarker,
    anchor?: google.maps.marker.AdvancedMarkerElement
  ) => {
    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow();
    }
    const container = document.createElement("div");
    container.style.minWidth = "220px";
    container.style.maxWidth = "260px";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "8px";

    const titleEl = document.createElement("div");
    titleEl.textContent = marker.title;
    titleEl.style.fontWeight = "600";
    container.appendChild(titleEl);

    const btnRow = document.createElement("div");
    btnRow.style.display = "flex";
    btnRow.style.gap = "8px";

    const editBtn = document.createElement("button");
    editBtn.textContent = "제목 수정";
    editBtn.style.padding = "6px 8px";
    editBtn.style.border = "1px solid #e5e7eb";
    editBtn.style.borderRadius = "6px";
    editBtn.onclick = () => {
      const next = window.prompt("새 제목을 입력하세요", marker.title);
      if (next && next.trim()) {
        setMarkers((prev) =>
          prev.map((m) =>
            m.id === marker.id ? { ...m, title: next.trim() } : m
          )
        );
      }
    };

    const catSelect = document.createElement("div");
    catSelect.style.display = "flex";
    catSelect.style.flexDirection = "column";
    catSelect.style.gap = "4px";

    const catLabel = document.createElement("div");
    catLabel.textContent = "카테고리:";
    catLabel.style.fontWeight = "600";
    catSelect.appendChild(catLabel);

    (Object.keys(CATEGORY_META) as MarkerCategory[]).forEach((k) => {
      const checkboxContainer = document.createElement("div");
      checkboxContainer.style.display = "flex";
      checkboxContainer.style.alignItems = "center";
      checkboxContainer.style.gap = "6px";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = marker.categories.includes(k);
      checkbox.onchange = () => {
        const newCategories = checkbox.checked
          ? [...marker.categories, k]
          : marker.categories.filter((cat) => cat !== k);
        setMarkers((prev) =>
          prev.map((m) =>
            m.id === marker.id ? { ...m, categories: newCategories } : m
          )
        );
      };

      const label = document.createElement("label");
      label.textContent = `${CATEGORY_META[k].emoji} ${CATEGORY_META[k].label}`;
      label.style.cursor = "pointer";

      checkboxContainer.appendChild(checkbox);
      checkboxContainer.appendChild(label);
      catSelect.appendChild(checkboxContainer);
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "삭제";
    delBtn.style.padding = "6px 8px";
    delBtn.style.border = "1px solid #ef4444";
    delBtn.style.color = "#ef4444";
    delBtn.style.borderRadius = "6px";
    delBtn.onclick = () => {
      setMarkers((prev) => prev.filter((m) => m.id !== marker.id));
      infoWindowRef.current?.close();
    };

    btnRow.appendChild(editBtn);
    btnRow.appendChild(catSelect);
    btnRow.appendChild(delBtn);
    container.appendChild(btnRow);

    infoWindowRef.current.setContent(container);
    if (anchor) {
      infoWindowRef.current.open({ map: map!, anchor, shouldFocus: false });
    } else {
      infoWindowRef.current.setPosition(marker.position);
      infoWindowRef.current.open({ map: map!, shouldFocus: false } as any);
    }
  };

  const openContextMenu = (marker: AppMarker, event: MouseEvent) => {
    event.preventDefault();

    // Remove existing context menu
    const existing = document.getElementById("marker-context-menu");
    if (existing) existing.remove();

    const menu = document.createElement("div");
    menu.id = "marker-context-menu";
    menu.style.position = "fixed";
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;
    menu.style.zIndex = "1000";
    menu.style.background = "#fff";
    menu.style.border = "1px solid #e5e7eb";
    menu.style.borderRadius = "8px";
    menu.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    menu.style.padding = "8px";
    menu.style.display = "flex";
    menu.style.flexDirection = "column";
    menu.style.gap = "4px";
    menu.style.minWidth = "160px";

    const editTitleBtn = document.createElement("button");
    editTitleBtn.textContent = "📝 제목 수정";
    editTitleBtn.style.padding = "8px 12px";
    editTitleBtn.style.border = "none";
    editTitleBtn.style.background = "transparent";
    editTitleBtn.style.textAlign = "left";
    editTitleBtn.style.borderRadius = "4px";
    editTitleBtn.style.cursor = "pointer";
    editTitleBtn.onmouseover = () =>
      (editTitleBtn.style.background = "#f3f4f6");
    editTitleBtn.onmouseout = () =>
      (editTitleBtn.style.background = "transparent");
    editTitleBtn.onclick = () => {
      const next = window.prompt("새 제목을 입력하세요", marker.title);
      if (next && next.trim()) {
        setMarkers((prev) =>
          prev.map((m) =>
            m.id === marker.id ? { ...m, title: next.trim() } : m
          )
        );
      }
      menu.remove();
    };

    const changeCategoryBtn = document.createElement("button");
    changeCategoryBtn.textContent = "🏷️ 카테고리 추가/제거";
    changeCategoryBtn.style.padding = "8px 12px";
    changeCategoryBtn.style.border = "none";
    changeCategoryBtn.style.background = "transparent";
    changeCategoryBtn.style.textAlign = "left";
    changeCategoryBtn.style.borderRadius = "4px";
    changeCategoryBtn.style.cursor = "pointer";
    changeCategoryBtn.onmouseover = () =>
      (changeCategoryBtn.style.background = "#f3f4f6");
    changeCategoryBtn.onmouseout = () =>
      (changeCategoryBtn.style.background = "transparent");
    changeCategoryBtn.onclick = () => {
      const categories = Object.keys(CATEGORY_META) as MarkerCategory[];

      // Create a simple category selection dialog
      const selectedCategories: MarkerCategory[] = [];
      categories.forEach((cat) => {
        if (
          confirm(
            `${CATEGORY_META[cat].emoji} ${CATEGORY_META[cat].label} 카테고리를 포함하시겠습니까?`
          )
        ) {
          selectedCategories.push(cat);
        }
      });

      if (selectedCategories.length > 0) {
        setMarkers((prev) =>
          prev.map((m) =>
            m.id === marker.id ? { ...m, categories: selectedCategories } : m
          )
        );
      }
      menu.remove();
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️ 삭제";
    deleteBtn.style.padding = "8px 12px";
    deleteBtn.style.border = "none";
    deleteBtn.style.background = "transparent";
    deleteBtn.style.textAlign = "left";
    deleteBtn.style.borderRadius = "4px";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.style.color = "#ef4444";
    deleteBtn.onmouseover = () => (deleteBtn.style.background = "#fef2f2");
    deleteBtn.onmouseout = () => (deleteBtn.style.background = "transparent");
    deleteBtn.onclick = () => {
      if (confirm("이 마커를 삭제하시겠습니까?")) {
        setMarkers((prev) => prev.filter((m) => m.id !== marker.id));
      }
      menu.remove();
    };

    menu.appendChild(editTitleBtn);
    menu.appendChild(changeCategoryBtn);
    menu.appendChild(deleteBtn);

    document.body.appendChild(menu);

    // Close menu when clicking outside
    const closeMenu = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        menu.remove();
        document.removeEventListener("click", closeMenu);
      }
    };
    setTimeout(() => document.addEventListener("click", closeMenu), 0);
  };

  console.log("API Key:", import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  console.log("Map ID:", import.meta.env.VITE_GOOGLE_MAPS_ID);

  return (
    <>
      {markers
        .filter((m) => m.categories?.some((cat) => filters[cat]))
        .map((m) => (
          <AdvancedMarker
            key={m.id}
            position={m.position}
            title={m.title}
            draggable
            onClick={(ev) => {
              const anchor = (
                ev as unknown as {
                  detail?: {
                    marker?: google.maps.marker.AdvancedMarkerElement;
                  };
                }
              ).detail?.marker;
              openInfo(m, anchor);
            }}
            ref={(markerEl) => {
              if (markerEl) {
                // Add right-click context menu
                const handleContextMenu = (event: MouseEvent) => {
                  openContextMenu(m, event);
                };
                markerEl.addEventListener("contextmenu", handleContextMenu);

                // Cleanup function
                return () => {
                  markerEl.removeEventListener(
                    "contextmenu",
                    handleContextMenu
                  );
                };
              }
            }}
            onDragEnd={(ev) => {
              const markerEl = (
                ev as unknown as {
                  detail?: {
                    marker?: google.maps.marker.AdvancedMarkerElement;
                  };
                }
              ).detail?.marker;
              const pos = markerEl?.position as google.maps.LatLng | undefined;
              if (pos) {
                const nextPos = { lat: pos.lat(), lng: pos.lng() };
                setMarkers((prev) =>
                  prev.map((mm) =>
                    mm.id === m.id ? { ...mm, position: nextPos } : mm
                  )
                );
              }
            }}
          >
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: CATEGORY_META[m.categories[0]].color,
                  border: `2px solid ${CATEGORY_META[m.categories[0]].border}`,
                  cursor: "pointer",
                }}
              />
              {m.categories.length > 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: CATEGORY_META[m.categories[1]].color,
                    border: `2px solid ${
                      CATEGORY_META[m.categories[1]].border
                    }`,
                    fontSize: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  {m.categories.length}
                </div>
              )}
            </div>
          </AdvancedMarker>
        ))}
    </>
  );
}

function BottomLeftPanel() {
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
}
