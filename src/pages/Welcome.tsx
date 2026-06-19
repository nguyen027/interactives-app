import InteractiveRenderer from "../components/InteractiveRenderer";
import { pages } from "../config/pages";

// Renders the welcome preview page.
export default function Welcome() {
  return <InteractiveRenderer page={pages.welcome} mode="preview" />;
}
