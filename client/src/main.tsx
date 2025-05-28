import { createRoot } from "react-dom/client";
import { Buffer } from 'buffer';
import App from "./App";
import "./index.css";

// Polyfill Buffer for react-pdf
if (typeof window !== 'undefined') {
  (window as any).global = window;
  (window as any).Buffer = Buffer;
}

createRoot(document.getElementById("root")!).render(<App />);
