import MapCore from "./components/MapCore";

const MapView = () => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: "#f6f8fa",
      }}
    >
      <MapCore />
    </div>
  );
};

export default MapView;
