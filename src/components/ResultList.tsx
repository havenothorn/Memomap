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
};

