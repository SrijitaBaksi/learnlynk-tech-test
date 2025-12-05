// File: frontend/pages/dashboard/create-task.tsx
import { useState } from "react";
import Link from "next/link";

// Function to call your Edge Function
async function createTask(applicationId: string, type: string, dueAt: string) {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const res = await fetch("https://htwhganqjprxgnciiptu.functions.supabase.co/create-task", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${anonKey}`
    },
    body: JSON.stringify({ application_id: applicationId, task_type: type, due_at: dueAt }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create task");
  return data;
}


export default function CreateTaskPage() {
  const [applicationId, setApplicationId] = useState("");
  const [taskType, setTaskType] = useState("call");
  const [dueAt, setDueAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const data = await createTask(applicationId, taskType, dueAt);
      setSuccessMsg("Task created successfully! Task ID: " + data.task_id);
      setApplicationId("");
      setTaskType("call");
      setDueAt("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ 
      minHeight: "100vh",
      background: "#f5f7fa",
      padding: "2rem",
      fontFamily: "system-ui"
    }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h1 style={{ margin: 0, color: "#333" }}>✏️ Create Task</h1>
          <Link
            href="/dashboard/today"
            style={{
              padding: "0.6rem 1.2rem",
              background: "white",
              color: "#667eea",
              border: "2px solid #667eea",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "0.9rem"
            }}
          >
            ← Back to Today
          </Link>
        </div>

        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>Fill in the details below to create a new task.</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span style={{ fontWeight: "600", color: "#333" }}>Application ID</span>
              <input
                type="text"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                placeholder="Enter application ID"
                required
                style={{ 
                  width: "100%", 
                  padding: "0.75rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  outline: "none"
                }}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span style={{ fontWeight: "600", color: "#333" }}>Task Type</span>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "0.75rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  outline: "none"
                }}
              >
                <option value="call">📞 Call</option>
                <option value="email">📧 Email</option>
                <option value="review">📝 Review</option>
              </select>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span style={{ fontWeight: "600", color: "#333" }}>Due At</span>
              <input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                required
                style={{ 
                  width: "100%", 
                  padding: "0.75rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  outline: "none"
                }}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "1rem",
                background: loading ? "#ccc" : "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "1rem",
                marginTop: "0.5rem"
              }}
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </form>

          {successMsg && (
            <div style={{ 
              marginTop: "1.5rem", 
              padding: "1rem", 
              background: "#d4edda", 
              color: "#155724",
              borderRadius: "8px",
              border: "1px solid #c3e6cb"
            }}>
              ✓ {successMsg}
            </div>
          )}
          
          {errorMsg && (
            <div style={{ 
              marginTop: "1.5rem", 
              padding: "1rem", 
              background: "#f8d7da", 
              color: "#721c24",
              borderRadius: "8px",
              border: "1px solid #f5c6cb"
            }}>
              ✗ {errorMsg}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
