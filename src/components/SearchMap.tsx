import { useEffect, useRef, useState } from "react";

type LatLng = google.maps.LatLngLiteral;
type Prediction = google.maps.places.AutocompletePrediction;

export default function SearchMap() {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);

  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // 1) 스크립트 로드 (weekly + places,marker)
  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
    if (!key) {
      console.error("Missing VITE_GOOGLE_MAPS_API_KEY");
      return;
    }

    const load = async () => {
      if ((window as any).google?.maps) return;
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        const params = new URLSearchParams({
          key,
          v: "weekly",
          libraries: "places,marker",
        });
        s.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
        s.async = true;
        s.defer = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Maps script failed"));
        document.head.appendChild(s);
      });
    };

    (async () => {
      await load();

      if (!mapDivRef.current) return;
      const center: LatLng = { lat: 37.5665, lng: 126.978 }; // 서울
      const mapInstance = new google.maps.Map(mapDivRef.current, {
        center,
        zoom: 12,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      });
      setMap(mapInstance);

      // AdvancedMarkerElement 권장
      const adv = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstance,
        position: center,
        title: "선택한 위치",
      });
      setMarker(adv);

      // 지도 클릭 시 마커 이동
      mapInstance.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const pos: LatLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        adv.position = pos;
        mapInstance.panTo(pos);
        mapInstance.setZoom(16);
        // 선택했으니 리스트 닫기
        setOpen(false);
        setActiveIndex(-1);
      });
    })();
  }, []);

  // 2) 예측 가져오기 (AutocompleteService)
  const fetchPredictions = (text: string) => {
    if (!text) {
      setPredictions([]);
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    const svc = new google.maps.places.AutocompleteService();
    // 한국 위주라면 componentRestrictions 사용
    svc.getPlacePredictions(
      {
        input: text,
        // bounds: map?.getBounds() ?? undefined,
        componentRestrictions: { country: ["kr"] },
      },
      (preds, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && preds) {
          setPredictions(preds);
          setOpen(true);
        } else {
          setPredictions([]);
          setOpen(false);
        }
        setActiveIndex(-1);
      }
    );
  };

  // 3) 예측 선택 → getDetails 로 좌표/정보 가져오기 → 마커 이동
  const selectPrediction = (pred: Prediction) => {
    if (!map || !marker) return;
    const placesSvc = new google.maps.places.PlacesService(map);
    placesSvc.getDetails(
      {
        placeId: pred.place_id,
        fields: ["geometry", "name", "formatted_address"],
      },
      (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place)
          return;
        const loc = place.geometry?.location;
        if (!loc) return;

        const pos: LatLng = { lat: loc.lat(), lng: loc.lng() };
        marker.position = pos;
        map.panTo(pos);
        map.setZoom(16);

        // 입력창엔 사람이 보기 좋은 텍스트로 반영
        setQuery(place.formatted_address || pred.description);
        setOpen(false);
        setActiveIndex(-1);
      }
    );
  };

  // 4) 입력 변화 핸들링 (간단 디바운스)
  useEffect(() => {
    const id = setTimeout(() => fetchPredictions(query), 180);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // 5) 키보드 네비게이션 (↑/↓/Enter/Escape)
  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open || predictions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % predictions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + predictions.length) % predictions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = predictions[activeIndex] ?? predictions[0];
      target && selectPrediction(target);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* 검색 박스 */}
      <div
        style={{
          position: "absolute",
          zIndex: 1000,
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          width: 360,
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && predictions.length > 0 && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="주소나 장소 검색 (예: 서울역, 부산 해운대)"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            fontSize: 15,
            outline: "none",
            background: "rgba(255,255,255,0.97)",
            boxShadow: "0 2px 10px #0001",
          }}
        />

        {open && predictions.length > 0 && (
          <div
            style={{
              marginTop: 6,
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              boxShadow: "0 8px 24px #0002",
              maxHeight: 280,
              overflowY: "auto",
            }}
          >
            {predictions.map((p, idx) => (
              <div
                key={p.place_id}
                onMouseDown={(e) => e.preventDefault()} // input blur로 닫히는 것 방지
                onClick={() => selectPrediction(p)}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  background: idx === activeIndex ? "#f3f4f6" : "#fff",
                  borderBottom:
                    idx !== predictions.length - 1
                      ? "1px solid #f3f4f6"
                      : undefined,
                }}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                <div style={{ fontWeight: 500, fontSize: 14 }}>
                  {p.structured_formatting.main_text}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {p.structured_formatting.secondary_text || p.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 지도 */}
      <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
