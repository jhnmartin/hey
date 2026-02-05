"use client";

import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";

export default function Home() {
  const tasks = useQuery(api.tasks.list);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "2rem",
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
      <ul style={{ listStyle: "none", padding: 0, fontSize: "1.25rem" }}>
        {tasks?.map((task) => (
          <li key={task._id} style={{ padding: "0.25rem 0" }}>
            {task.isCompleted ? "✅" : "⬜"} {task.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
