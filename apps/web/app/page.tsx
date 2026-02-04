export default function Home() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <span
        style={{
          fontSize: "clamp(4rem, 20vw, 20rem)",
          fontWeight: 600,
          color: "#000",
          lineHeight: 1,
        }}
      >
        hey
      </span>
    </div>
  );
}
