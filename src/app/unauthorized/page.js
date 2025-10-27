export default function UnauthorizedPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <h1>🚫 Unauthorized Access</h1>
      <p>You don’t have permission to view this page.</p>
      <a href="/" style={{ marginTop: "1rem", color: "#0070f3" }}>
        Go back to home
      </a>
    </div>
  );
}
