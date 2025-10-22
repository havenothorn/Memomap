import { AdvancedMarker } from "@vis.gl/react-google-maps";
import type { AppMarker } from "../types/map.ts";
import { CATEGORY_META } from "../types/map.ts";

interface MarkerProps {
  marker: AppMarker;
  onInfoOpen: (
    marker: AppMarker,
    anchor?: google.maps.marker.AdvancedMarkerElement
  ) => void;
  onContextMenu: (marker: AppMarker, event: MouseEvent) => void;
  onDragEnd: (
    marker: AppMarker,
    newPosition: google.maps.LatLngLiteral
  ) => void;
}

export const Marker = ({
  marker,
  onInfoOpen,
  onContextMenu,
  onDragEnd,
}: MarkerProps) => {
  return (
    <AdvancedMarker
      key={marker.id}
      position={marker.position}
      title={marker.title}
      draggable
      onClick={(ev) => {
        const anchor = (
          ev as unknown as {
            detail?: {
              marker?: google.maps.marker.AdvancedMarkerElement;
            };
          }
        ).detail?.marker;
        onInfoOpen(marker, anchor);
      }}
      ref={(markerEl) => {
        if (markerEl) {
          // Add right-click context menu
          const handleContextMenu = (event: MouseEvent) => {
            onContextMenu(marker, event);
          };
          markerEl.addEventListener("contextmenu", handleContextMenu);

          // Cleanup function
          return () => {
            markerEl.removeEventListener("contextmenu", handleContextMenu);
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
          onDragEnd(marker, nextPos);
        }
      }}
    >
      <div style={{ position: "relative" }}>
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: CATEGORY_META[marker.categories[0]].color,
            border: `2px solid ${CATEGORY_META[marker.categories[0]].border}`,
            cursor: "pointer",
          }}
        />
        {marker.categories.length > 1 && (
          <div
            style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: CATEGORY_META[marker.categories[1]].color,
              border: `2px solid ${CATEGORY_META[marker.categories[1]].border}`,
              fontSize: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
            }}
          >
            {marker.categories.length}
          </div>
        )}
      </div>
    </AdvancedMarker>
  );
};
