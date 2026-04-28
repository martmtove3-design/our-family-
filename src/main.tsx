import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./heritage-theme.css";
import "./lib/i18n"; // Initialize i18n
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="heritage-theme min-h-screen">
      <App />
    </div>
  </StrictMode>,
);