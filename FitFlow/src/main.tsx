import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { DemoProvider } from "@/contexts/DemoContext";
import { AuthProvider } from "@/contexts/AuthContext"; // 🔹 import AuthProvider

createRoot(document.getElementById("root")!).render(
  <AuthProvider>      {/* 🔹 wrap app with AuthProvider first */}
    <DemoProvider>     {/* 🔹 keep DemoProvider inside */}
      <App />
    </DemoProvider>
  </AuthProvider>
);

