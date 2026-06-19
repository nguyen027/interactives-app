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
            [
              <Route
                key={key}
                path={(pages[key].previewPath || "").replace("/preview/", "")}
                element={<EditablePreview pageKey={key} />}
              />,
              <Route
                key={`${key}-instance`}
                path={`${(pages[key].previewPath || "").replace(
                  "/preview/",
                  "",
                )}/:instanceId`}
                element={<EditablePreview pageKey={key} />}
              />,
            ]
          ))}
        </Route>

        {publicPageKeys.map((key) => (
          [
            <Route
              key={key}
              path={pages[key].publicPath}
              element={<SavedInteractivePage pageKey={key} />}
            />,
            <Route
              key={`${key}-instance`}
              path={`${pages[key].publicPath}/:instanceId`}
              element={<SavedInteractivePage pageKey={key} />}
            />,
          ]
        ))}

        {publicPageKeys.flatMap((key) =>
          (pages[key].aliases || []).map((alias) => (
            [
              <Route
                key={alias}
                path={alias}
                element={<SavedInteractivePage pageKey={key} />}
              />,
              <Route
                key={`${alias}-instance`}
                path={`${alias}/:instanceId`}
                element={<SavedInteractivePage pageKey={key} />}
              />,
            ]
          )),
        )}
      </Routes>
    </BrowserRouter>
  );
}
