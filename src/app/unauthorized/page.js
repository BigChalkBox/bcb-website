import Link from "next/link";

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
      <p>You do not have permission to view this page.</p>
      <Link href="/" style={{ marginTop: "1rem", color: "#0070f3" }}>
        Go back to home
      </Link>
    </div>
  );
}
