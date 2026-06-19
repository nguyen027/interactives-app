import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import EditablePreview from "./components/EditablePreview";
import InteractiveRenderer from "./components/InteractiveRenderer";
import SavedInteractivePage from "./components/SavedInteractivePage";
import { pageKeys, pages } from "./config/pages";
import AppLayout from "./layouts/AppLayout";

const publicPageKeys = pageKeys.filter((key) => key !== "welcome");

// Defines all public and preview routes for the interactive pages.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/preview" replace />} />
        <Route path="/admin" element={<Navigate to="/preview" replace />} />

        <Route path="/preview" element={<AppLayout />}>
          <Route
            index
            element={<InteractiveRenderer page={pages.welcome} mode="preview" />}
          />
          {publicPageKeys.map((key) => (
            <Route
              key={key}
              path={(pages[key].previewPath || "").replace("/preview/", "")}
              element={
                key === "challenge" ? (
                  <EditablePreview pageKey={key} />
                ) : (
                  <InteractiveRenderer page={pages[key]} mode="preview" />
                )
              }
            />
          ))}
        </Route>

        {publicPageKeys.map((key) => (
          <Route
            key={key}
            path={pages[key].publicPath}
            element={
              key === "challenge" ? (
                <SavedInteractivePage pageKey={key} />
              ) : (
                <InteractiveRenderer page={pages[key]} />
              )
            }
          />
        ))}

        {publicPageKeys.flatMap((key) =>
          (pages[key].aliases || []).map((alias) => (
            <Route
              key={alias}
              path={alias}
              element={
                key === "challenge" ? (
                  <SavedInteractivePage pageKey={key} />
                ) : (
                  <InteractiveRenderer page={pages[key]} />
                )
              }
            />
          )),
        )}
      </Routes>
    </BrowserRouter>
  );
}
