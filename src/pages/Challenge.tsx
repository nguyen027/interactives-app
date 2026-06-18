import InteractiveRenderer from "../components/InteractiveRenderer";
import { pages } from "../config/pages";

export default function Challenge() {
  return <InteractiveRenderer page={pages.challenge} />;
}
