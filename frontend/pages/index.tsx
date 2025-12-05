import Link from "next/link";

export default function Home() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center", 
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "system-ui",
      padding: "2rem"
    }}>
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "3rem",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        maxWidth: "500px",
        width: "100%",
        textAlign: "center"
      }}>
        <h1 style={{ margin: "0 0 1rem 0", color: "#333", fontSize: "2rem" }}>LearnLynk</h1>
        <p style={{ color: "#666", marginBottom: "2rem" }}>Task Management Dashboard</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Link
            href="/dashboard/today"
            style={{
              padding: "1rem",
              background: "#667eea",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: "600",
              transition: "transform 0.2s",
              display: "block"
            }}
          >
            📋 Today's Tasks
          </Link>

          <Link
            href="/dashboard/create-task"
            style={{
              padding: "1rem",
              background: "#764ba2",
              color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "600",
            transition: "transform 0.2s",
            display: "block"
          }}
        >
          ✏️ Create Task
        </Link>
        </div>
      </div>
    </div>
  );
}
