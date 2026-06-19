import type { InteractivePageConfig } from "../types/page";

export const pageKeys = [
  "challenge",
  "trivia",
  "orderConfirmation",
  "propBet",
] as const;

export type PageKey = (typeof pageKeys)[number];

function createSimplePageElements(title: string): InteractivePageConfig["elements"] {
  return [
    {
      id: "title",
      type: "text",
      text: title,
      x: 50,
      y: 50,
      align: "center",
      fontSize: 72,
      color: "#ffffff",
      fontFamily: "system-ui, sans-serif",
      fontWeight: 700,
      bgOpacity: 0,
    },
  ];
}

export const pages: Record<PageKey, InteractivePageConfig> = {
  challenge: {
    slug: "challenge",
    type: "challenge",
    title: "Challenge",
    navLabel: "Challenge",
    publicPath: "/challenge",
    previewPath: "/preview/challenge",
    background: {
      type: "color",
      color: "#2563eb",
    },
    elements: createSimplePageElements("Challenge"),
  },

  trivia: {
    type: "trivia",
    title: "Trivia",
    navLabel: "Trivia",
    publicPath: "/trivia",
    previewPath: "/preview/trivia",
    background: {
      type: "color",
      color: "#2563eb",
    },
    elements: createSimplePageElements("Trivia"),
  },

  orderConfirmation: {
    type: "orderConfirmation",
    title: "Order Confirmation",
    navLabel: "Order Confirmation",
    publicPath: "/order_confirmation",
    previewPath: "/preview/order_confirmation",
    aliases: ["/order-confirmation"],
    background: {
      type: "color",
      color: "#2563eb",
    },
    elements: createSimplePageElements("Order Confirmation"),
  },

  propBet: {
    type: "propBet",
    title: "Prop Bet",
    navLabel: "Prop Bet",
    publicPath: "/prop_bet",
    previewPath: "/preview/prop_bet",
    aliases: ["/prop-bet"],
    background: {
      type: "color",
      color: "#2563eb",
    },
    elements: createSimplePageElements("Prop Bet"),
  },
};

export const previewNavItems = pageKeys.map((key) => {
  const page = pages[key];

  return {
    key,
    label: page.navLabel || page.title,
    path: page.previewPath || "/preview",
  };
});
