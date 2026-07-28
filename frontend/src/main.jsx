import React from "react";
import ReactDOM from "react-dom/client";
import "./i18n";
import App from "./App";
import "./index.css";
import "leaflet/dist/leaflet.css";

import { DashboardEditProvider } from "./context/DashboardEditContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <DashboardEditProvider>
    <App />
  </DashboardEditProvider>
);