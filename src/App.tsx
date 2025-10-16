import React from "react";
import { Header } from "./components/Header";
import Footer from "./components/Footer";
import MapCore from "./components/MapCore";

const App: React.FC = () => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        fontFamily: "Segoe UI",
        background: "#f6f8fa",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      <MapCore />
      <Footer />
    </div>
  );
};

export default App;
