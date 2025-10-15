const Footer = () => (
  <footer
    style={{
      width: "100%",
      height: 44,
      background: "#f3f4f6",
      borderTop: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 14,
      color: "#888",
      position: "fixed",
      left: 0,
      bottom: 0,
      zIndex: 100,
    }}
  >
    <span>
      © 2025 MEMOMAB |{" "}
      <a
        href="#support"
        style={{
          color: "#daa32bff",
          textDecoration: "none",
          margin: "0 8px",
        }}
      >
        Support ☕
      </a>{" "}
      |{" "}
      <a
        href="#about"
        style={{
          color: "#daa32bff",
          textDecoration: "none",
          margin: "0 8px",
        }}
      >
        Developer Nami 💡
      </a>
    </span>
  </footer>
);

export default Footer;
