import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Seed service types
fetch("/api/seed-services")
  .then(res => res.json())
  .catch(err => console.error("Error seeding services:", err));

createRoot(document.getElementById("root")!).render(<App />);
