import { createFileRoute } from "@tanstack/react-router";
import { Header } from "../components/Header";
import Footer from "../components/Footer";
import SearchMap from "../components/SearchMap";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Header />
      <div style={{ width: "100%", height: "90vh", marginTop: 56 }}>
        <SearchMap />
      </div>
      <Footer />
    </div>
  );
}
