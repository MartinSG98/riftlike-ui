import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { CatalogProvider } from "./state/catalog";

export default function App() {
  return (
    <CatalogProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <main className="page center">
                <h1 className="display">Riftlike</h1>
              </main>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CatalogProvider>
  );
}
