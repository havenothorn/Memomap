import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";
import type { AppMarker, MarkerCategory, LatLngLiteral } from "../types/map.ts";
import { Marker } from "./Marker";
import { createInfoWindowContent } from "./InfoWindow";
import { createContextMenu } from "./ContextMenu";

export const InteractiveLayer = () => {
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

  const handleTitleUpdate = (markerId: string, newTitle: string) => {
    setMarkers((prev) =>
      prev.map((m) => (m.id === markerId ? { ...m, title: newTitle } : m))
    );
  };

  const handleCategoriesUpdate = (
    markerId: string,
    newCategories: MarkerCategory[]
  ) => {
    setMarkers((prev) =>
      prev.map((m) =>
        m.id === markerId ? { ...m, categories: newCategories } : m
      )
    );
  };

  const handleMemoUpdate = (markerId: string, newMemo: string) => {
    setMarkers((prev) =>
      prev.map((m) => (m.id === markerId ? { ...m, memo: newMemo } : m))
    );
  };

  const handleDelete = (markerId: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== markerId));
    infoWindowRef.current?.close();
  };

  const openInfo = (
    marker: AppMarker,
    anchor?: google.maps.marker.AdvancedMarkerElement
  ) => {
    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow();
    }

    const container = createInfoWindowContent({
      marker,
      onMemoUpdate: handleMemoUpdate,
    });

    infoWindowRef.current.setContent(container);
    if (anchor) {
      infoWindowRef.current.open({ map: map!, anchor, shouldFocus: false });
    } else {
      infoWindowRef.current.setPosition(marker.position);
      infoWindowRef.current.open({ map: map!, shouldFocus: false } as any);
    }
  };

  const openContextMenu = (marker: AppMarker, event: MouseEvent) => {
    createContextMenu(event, {
      marker,
      onTitleUpdate: handleTitleUpdate,
      onMemoUpdate: handleMemoUpdate,
      onCategoriesUpdate: handleCategoriesUpdate,
      onDelete: handleDelete,
    });
  };

  const handleDragEnd = (marker: AppMarker, newPosition: LatLngLiteral) => {
    setMarkers((prev) =>
      prev.map((m) =>
        m.id === marker.id ? { ...m, position: newPosition } : m
      )
    );
  };

  return (
    <>
      {markers
        .filter((m) => m.categories?.some((cat) => filters[cat]))
        .map((m) => (
          <Marker
            key={m.id}
            marker={m}
            onInfoOpen={openInfo}
            onContextMenu={openContextMenu}
            onDragEnd={handleDragEnd}
          />
        ))}
    </>
  );
};
