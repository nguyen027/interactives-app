import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import InteractiveRenderer from "./components/InteractiveRenderer";
import { pageKeys, pages } from "./config/pages";
import AppLayout from "./layouts/AppLayout";

const publicPageKeys = pageKeys.filter((key) => key !== "welcome");

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
              element={<InteractiveRenderer page={pages[key]} mode="preview" />}
            />
          ))}
        </Route>

        {publicPageKeys.map((key) => (
          <Route
            key={key}
            path={pages[key].publicPath}
            element={<InteractiveRenderer page={pages[key]} />}
          />
        ))}

        {publicPageKeys.flatMap((key) =>
          (pages[key].aliases || []).map((alias) => (
            <Route
              key={alias}
              path={alias}
              element={<InteractiveRenderer page={pages[key]} />}
            />
          )),
        )}
      </Routes>
    </BrowserRouter>
  );
}
