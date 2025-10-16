import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const typeColor: Record<string, string> = {
  나: "#1e90ff",
  함께: "#32cd32",
};

type Place = {
  lat: number;
  lng: number;
  type: keyof typeof typeColor;
  name: string;
};

const DEFAULT_PLACES: Place[] = [
  { lat: 37.5665, lng: 126.978, type: "나", name: "서울" },
  { lat: 35.1796, lng: 129.0756, type: "나", name: "부산" },
  { lat: 33.4996, lng: 126.5312, type: "함께", name: "제주" },
];

interface MapCoreProps {
  showLegend?: boolean;
  showTypeFilter?: boolean;
  style?: React.CSSProperties;
}

const MapCore = ({
  showLegend = true,
  showTypeFilter = true,
  style,
}: MapCoreProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [places, setPlaces] = useState<Place[]>(DEFAULT_PLACES);
  const [form, setForm] = useState({ name: "", type: "나", address: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [visibleTypes, setVisibleTypes] = useState<string[]>(["나"]);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapRef.current) return;
    // Load style JSON so we can prefer Korean labels (name:ko) when available.
    const styleUrl = "https://tiles.stadiamaps.com/styles/osm_bright.json";
    const initMapWithStyle = async () => {
      try {
        const res = await fetch(styleUrl);
        const styleJson = await res.json();

        // Modify symbol layers to prefer Korean labels when possible.
        if (styleJson && Array.isArray(styleJson.layers)) {
          styleJson.layers = styleJson.layers.map((layer: any) => {
            // Only change symbol text fields where a text-field is present
            // and the layer type is symbol.
            if (
              layer.type === "symbol" &&
              layer.layout &&
              layer.layout["text-field"]
            ) {
              // Replace text-field with coalesce(get('name:ko'), get('name')) to prefer Korean name.
              layer.layout["text-field"] = [
                "coalesce",
                ["get", "name:ko"],
                layer.layout["text-field"],
              ];
            }
            return layer;
          });
        }

        mapRef.current = new maplibregl.Map({
          container: mapContainer.current!,
          style: styleJson,
          center: [127.5, 36.5],
          zoom: 6.2,
        });
      } catch (err) {
        // Fallback to original style url if fetch or parsing fails
        mapRef.current = new maplibregl.Map({
          container: mapContainer.current!,
          style: styleUrl,
          center: [127.5, 36.5],
          zoom: 6.2,
        });
      }
    };

    initMapWithStyle();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    (mapRef.current as any)._markers?.forEach((m: any) => m.remove());
    (mapRef.current as any)._markers = [];
    places
      .filter((place) => visibleTypes.includes(place.type))
      .forEach((place) => {
        const el = document.createElement("div");
        el.style.background = typeColor[place.type];
        el.style.width = "10px";
        el.style.height = "10px";
        el.style.borderRadius = "50%";
        el.style.border = "2px solid #fff";
        el.style.boxShadow = "0 0 4px #888";
        el.title = place.name;
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([place.lng, place.lat])
          .setPopup(
            new maplibregl.Popup({ offset: 12 }).setHTML(
              `<div style='font-weight:600'>${place.name}</div><div style='font-size:12px;color:#888'>${place.type}</div>`
            )
          )
          .addTo(mapRef.current!);
        (mapRef.current as any)._markers.push(marker);
      });
  }, [places, visibleTypes]);

  async function geocodeAll(address: string): Promise<any[]> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}`;
    const res = await fetch(url);
    const data = await res.json();
    return data;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setShowResults(false);
    setSearchResults([]);
    if (!form.address) {
      setError("주소를 입력해 주세요.");
      setLoading(false);
      return;
    }
    const results = await geocodeAll(form.address);
    if (!results || results.length === 0) {
      setError("주소를 찾을 수 없습니다.");
      setLoading(false);
      return;
    }
    setSearchResults(results);
    setShowResults(true);
    setLoading(false);
  };

  const handleSelectResult = (result: any) => {
    setPlaces([
      ...places,
      {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        type: form.type as Place["type"],
        name: form.name || result.display_name,
      },
    ]);
    setForm({ name: "", type: "나", address: "" });
    setShowResults(false);
    setSearchResults([]);
    setError("");
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        ...style,
      }}
    >
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "100%",
          flex: 1,
        }}
      />

      <form
        onSubmit={handleSubmit}
        style={{
          position: "absolute",
          top: 88,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(255,255,255,0.97)",
          boxShadow: "0 4px 24px #0002",
          borderRadius: 16,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: 340,
          zIndex: 20,
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 20,
            marginBottom: 4,
            color: "#222",
          }}
        >
          여행지 추가하기
        </div>
        <input
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            fontSize: 15,
            outline: "none",
            transition: "border 0.2s",
          }}
          placeholder="기억할 수 있는 키워드"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <input
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            fontSize: 15,
            outline: "none",
            transition: "border 0.2s",
          }}
          placeholder="주소 또는 장소명 (예: 서울, 부산역, 제주공항)"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          required
        />
        {showTypeFilter && (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 14, color: "#666" }}>구분:</span>
            <select
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                fontSize: 15,
                outline: "none",
              }}
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="나">나</option>
              <option value="함께">함께</option>
            </select>
            <button
              type="submit"
              style={{
                background: "#2563eb",
                color: "#fff",
                padding: "8px 20px",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 15,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                transition: "background 0.2s",
              }}
              disabled={loading}
            >
              {loading ? "검색 중..." : "검색"}
            </button>
          </div>
        )}
        {error && (
          <div style={{ color: "#ef4444", fontSize: 13, marginTop: 2 }}>
            {error}
          </div>
        )}
      </form>

      {showResults && searchResults.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: 120,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            boxShadow: "0 2px 12px #0001",
            zIndex: 30,
            width: 360,
            maxHeight: 260,
            overflowY: "auto",
          }}
        >
          {searchResults.map((result, idx) => (
            <div
              key={result.place_id}
              style={{
                padding: "12px 18px",
                borderBottom:
                  idx !== searchResults.length - 1
                    ? "1px solid #f1f1f1"
                    : undefined,
                cursor: "pointer",
                background: "#fff",
                transition: "background 0.15s",
              }}
              onClick={() => handleSelectResult(result)}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#f3f4f6")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
            >
              <div style={{ fontWeight: 500, fontSize: 15 }}>
                {result.display_name.split(",")[0]}
              </div>
              <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
                {result.display_name}
              </div>
            </div>
          ))}
        </div>
      )}

      {showLegend && (
        <div
          style={{
            position: "absolute",
            left: 24,
            bottom: 64,
            background: "rgba(255,255,255,0.93)",
            borderRadius: 12,
            boxShadow: "0 2px 12px #0001",
            padding: "16px 22px",
            fontSize: 15,
            zIndex: 20,
            border: "1px solid #e5e7eb",
            minWidth: 120,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>범례</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.keys(typeColor).map((type) => (
              <label
                key={type}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={visibleTypes.includes(type)}
                  onChange={() => {
                    setVisibleTypes((prev) =>
                      prev.includes(type)
                        ? prev.length === 1
                          ? prev
                          : prev.filter((t) => t !== type)
                        : [...prev, type]
                    );
                  }}
                  style={{
                    accentColor: typeColor[type],
                    width: 16,
                    height: 16,
                  }}
                />
                <span style={{ color: typeColor[type], fontSize: 18 }}>●</span>
                <span style={{ fontSize: 15 }}>{type}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapCore;
