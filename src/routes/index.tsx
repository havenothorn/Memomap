import { createFileRoute } from "@tanstack/react-router";
import MapPage from "../pages/MapPage";

export const Route = createFileRoute("/")({
  component: MapPage,
});
