const Header = () => (
  <header
    style={{
      width: "100%",
      height: 56,
      background: "#fff",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 16px",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 100,
      boxShadow: "0 2px 8px #0001",
      boxSizing: "border-box",
    }}
  >
    <img src="/logo.png" alt="MemoMap Logo" style={{ height: 40 }} />
    <NavMenu />
  </header>
);

const NavMenu = () => (
  <nav style={{ display: "flex", gap: 24 }}>
    <a
      href="#support"
      style={{
        color: "#444",
        fontWeight: 500,
        textDecoration: "none",
        fontSize: 15,
      }}
    >
      ☕ Support
    </a>
    <a
      href="#about"
      style={{
        color: "#444",
        fontWeight: 500,
        textDecoration: "none",
        fontSize: 15,
      }}
    >
      개발자 소개
    </a>
  </nav>
);

export { Header, NavMenu };
