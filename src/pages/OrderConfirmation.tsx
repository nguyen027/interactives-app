import InteractiveRenderer from "../components/InteractiveRenderer";
import { pages } from "../config/pages";

export default function OrderConfirmation() {
  return <InteractiveRenderer page={pages.orderConfirmation} />;
}
