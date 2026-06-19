import InteractiveRenderer from "../components/InteractiveRenderer";
import { pages } from "../config/pages";

// Renders the public prop bet page.
export default function PropBet() {
  return <InteractiveRenderer page={pages.propBet} />;
}
