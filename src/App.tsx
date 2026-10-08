import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { RunPage } from "./pages/RunPage";
import { TeamSelectPage } from "./pages/TeamSelectPage";
import { TitlePage } from "./pages/TitlePage";
import { CatalogProvider } from "./state/catalog";

export default function App() {
  return (
    <CatalogProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TitlePage />} />
          <Route path="/teams" element={<TeamSelectPage />} />
          <Route path="/run/:id" element={<RunPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CatalogProvider>
  );
}
