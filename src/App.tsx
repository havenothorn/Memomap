import { Header } from "./components/Header";
import Footer from "./components/Footer";
import MapCore from "./components/MapCore";

const App = () => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: "#f6f8fa",
      }}
    >
      <Header />
      <MapCore />
      <Footer />
    </div>
  );
};

export default App;
