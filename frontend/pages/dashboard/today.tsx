import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

type Task = {
  id: string;
  type: string;
  status: string;
  application_id: string;
  due_at: string;
};

export default function TodayDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchTasks() {
    setLoading(true);
    setError(null);

    try {
      // Get today's date in UTC
      const now = new Date();
      const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

      console.log('Fetching tasks from', startOfDay.toISOString(), 'to', endOfDay.toISOString());

      const { data, error: fetchError } = await supabase
        .from("tasks")
        .select("*")
        .neq("status", "completed")
        .gte("due_at", startOfDay.toISOString())
        .lte("due_at", endOfDay.toISOString())
        .order("due_at", { ascending: true });

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }

      console.log('Fetched tasks:', data);
      setTasks(data || []);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  async function markComplete(id: string) {
    try {
      const { error } = await supabase.from("tasks").update({ status: "completed" }).eq("id", id);
      if (error) throw error;
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      console.error('Error marking complete:', err);
      alert('Failed to mark task as complete');
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>
      <div>Loading tasks...</div>
    </div>
  );
  
  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>
      <div style={{ color: "red" }}>Error: {error}</div>
    </div>
  );

  return (
    <main style={{ 
      minHeight: "100vh",
      background: "#f5f7fa",
      padding: "2rem",
      fontFamily: "system-ui"
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h1 style={{ margin: 0, color: "#333" }}>📅 Today's Tasks</h1>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link
              href="/dashboard/create-task"
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
              ✏️ Create Task
            </Link>
          </div>
        </div>

        {tasks.length === 0 && (
          <div style={{
            background: "white",
            padding: "3rem",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <p style={{ fontSize: "1.2rem", margin: 0 }}>No tasks due today 🎉</p>
          </div>
        )}

        {tasks.length > 0 && (
          <div style={{
            background: "white",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#495057" }}>Type</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#495057" }}>Application</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#495057" }}>Due At</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#495057" }}>Status</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#495057" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} style={{ borderBottom: "1px solid #e9ecef" }}>
                    <td style={{ padding: "1rem" }}>
                      <span style={{
                        background: "#e7f3ff",
                        color: "#0056b3",
                        padding: "0.3rem 0.6rem",
                        borderRadius: "4px",
                        fontSize: "0.85rem",
                        fontWeight: "600"
                      }}>
                        {task.type}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#6c757d" }}>
                      {task.application_id.substring(0, 8)}...
                    </td>
                    <td style={{ padding: "1rem", fontSize: "0.9rem" }}>
                      {new Date(task.due_at).toLocaleString()}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{
                        background: "#d4edda",
                        color: "#155724",
                        padding: "0.3rem 0.6rem",
                        borderRadius: "4px",
                        fontSize: "0.85rem"
                      }}>
                        {task.status}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <button 
                        onClick={() => markComplete(task.id)}
                        style={{
                          padding: "0.5rem 1rem",
                          background: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "0.85rem"
                        }}
                      >
                        ✓ Complete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
