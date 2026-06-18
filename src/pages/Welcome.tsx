import InteractiveRenderer from "../components/InteractiveRenderer";
import { pages } from "../config/pages";

export default function Welcome() {
  return <InteractiveRenderer page={pages.welcome} mode="preview" />;
}
