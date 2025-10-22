interface ResultListProps {
  results: Array<google.maps.places.PlaceResult>;
  onPick: (r: google.maps.places.PlaceResult) => void;
  onRegister: (r: google.maps.places.PlaceResult) => void;
}

export const ResultList = ({
  results,
  onPick,
  onRegister,
}: ResultListProps) => {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px #0002",
        overflow: "visible",
        width: "100%",
        maxWidth: "600px",
      }}
    >
      {results.map((r, i) => (
        <div
          key={(r.place_id ?? "") + i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: 12,
            borderTop: i === 0 ? "none" : "1px solid #eee",
            background: "#fff",
          }}
        >
          <button
            onClick={() => onPick(r)}
            style={{
              display: "flex",
              alignItems: "center",
              background: "transparent",
              border: 0,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                lineHeight: "16px",
                fontWeight: 600,
                marginRight: "10px",
              }}
            >
              {r.name}
            </span>
            {r.formatted_address && (
              <span
                style={{
                  color: "#6b7280",
                  fontSize: "12px",
                  alignItems: "center",
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
};
