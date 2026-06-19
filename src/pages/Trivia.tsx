import InteractiveRenderer from "../components/InteractiveRenderer";
import { pages } from "../config/pages";

// Renders the public trivia page.
export default function Trivia() {
  return <InteractiveRenderer page={pages.trivia} />;
}
