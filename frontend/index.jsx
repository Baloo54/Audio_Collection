import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles.css";

import AudioCollectionApp from "@/AudioCollectionApp.jsx";

const root = createRoot(document.getElementById("root"));

root.render(
  <StrictMode>
    <AudioCollectionApp />
  </StrictMode>
);
