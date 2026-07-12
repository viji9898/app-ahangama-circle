import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import CircleVerify from "./CircleVerify.jsx";
import Join from "./Join.jsx";
import Promo from "./Promo.jsx";
import PromoVerify from "./PromoVerify.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Promo />} />
        <Route path="/cv" element={<CircleVerify />} />
        <Route path="/join" element={<Join />} />
        <Route path="/promo" element={<Promo />} />
        <Route path="/pv" element={<PromoVerify />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
