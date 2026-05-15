import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import { WardrobeDataProvider } from "./context/WardrobeDataProvider.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <WardrobeDataProvider>
        <App />
      </WardrobeDataProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
