import InteractiveRenderer from "../components/InteractiveRenderer";
import { pages } from "../config/pages";

// Renders the public challenge page.
export default function Challenge() {
  return <InteractiveRenderer page={pages.challenge} />;
}
