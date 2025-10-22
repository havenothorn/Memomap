export type LatLngLiteral = google.maps.LatLngLiteral;

export type MarkerCategory = "추억" | "위시" | "봄" | "여름" | "가을" | "겨울";

export type AppMarker = {
  id: string;
  position: LatLngLiteral;
  title: string;
  memo?: string;
  categories: MarkerCategory[];
};

export const CATEGORY_META: Record<
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
