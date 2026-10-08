import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { TitlePage } from "./pages/TitlePage";
import { CatalogProvider } from "./state/catalog";

export default function App() {
  return (
    <CatalogProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TitlePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CatalogProvider>
  );
}
