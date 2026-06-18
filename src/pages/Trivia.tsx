import InteractiveRenderer from "../components/InteractiveRenderer";
import { pages } from "../config/pages";

export default function Trivia() {
  return <InteractiveRenderer page={pages.trivia} />;
}
