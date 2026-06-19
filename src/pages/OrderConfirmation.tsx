import InteractiveRenderer from "../components/InteractiveRenderer";
import { pages } from "../config/pages";

// Renders the public order confirmation page.
export default function OrderConfirmation() {
  return <InteractiveRenderer page={pages.orderConfirmation} />;
}
