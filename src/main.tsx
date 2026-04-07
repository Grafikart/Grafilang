import { createRoot } from "react-dom/client";
import { App } from "./ui/App.tsx";
import "./main.css";

document.documentElement.classList.add("dark");

createRoot(document.getElementById("app")!).render(<App />);
