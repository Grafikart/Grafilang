import { createRoot } from "react-dom/client";
import { App } from "./ui/App.tsx";
import "./main.css";

createRoot(document.getElementById("app")!).render(<App />);
