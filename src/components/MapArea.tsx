import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { InteractiveLayer } from "./InteractiveLayer";
import { SearchOverlay } from "./SearchOverlay";
import { BottomLeftPanel } from "./BottomLeftPanel";

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
