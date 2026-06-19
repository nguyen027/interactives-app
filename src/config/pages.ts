import type { InteractivePageConfig } from "../types/page";

export const pageKeys = [
  "welcome",
  "challenge",
  "trivia",
  "orderConfirmation",
  "propBet",
] as const;

export type PageKey = (typeof pageKeys)[number];

export const pages: Record<PageKey, InteractivePageConfig> = {
  welcome: {
    type: "welcome",
    title: "Welcome",
    navLabel: "Welcome",
    previewPath: "/preview",
    subtitle: "Select an interactive from the left menu.",
    message: "Dynamic React + Tailwind interactive platform.",
  },

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
    elements: [
      {
        id: "title",
        type: "text",
        text: "Interactives app",
        x: 50,
        y: 34,
        align: "center",
        fontSize: 72,
        color: "#ffffff",
        fontFamily: "system-ui, sans-serif",
        fontWeight: 700,
        bgOpacity: 0,
      },
      {
        id: "timer",
        type: "countdown",
        x: 50,
        y: 68,
        seconds: 220,
        size: 112,
      },
    ],
  },

  trivia: {
    type: "trivia",
    title: "Trivia",
    navLabel: "Trivia",
    publicPath: "/trivia",
    previewPath: "/preview/trivia",
    elements: [
      {
        id: "title",
        type: "text",
        text: "Trivia",
        x: 50,
        y: 14,
        fontSize: 44,
        color: "#ffffff",
        bgOpacity: 0,
      },
      {
        id: "question",
        type: "text",
        text: "Who won the championship?",
        x: 50,
        y: 31,
        width: "76%",
        fontSize: 42,
        color: "#ffffff",
        bgColor: "#000000",
        bgOpacity: 0.35,
      },
      {
        id: "option-a",
        type: "button",
        label: "Team A",
        x: 34,
        y: 55,
        width: "28%",
        fontSize: 24,
        bgColor: "#3f3f46",
      },
      {
        id: "option-b",
        type: "button",
        label: "Team B",
        x: 66,
        y: 55,
        width: "28%",
        fontSize: 24,
        bgColor: "#3f3f46",
      },
      {
        id: "option-c",
        type: "button",
        label: "Team C",
        x: 34,
        y: 72,
        width: "28%",
        fontSize: 24,
        bgColor: "#3f3f46",
      },
      {
        id: "option-d",
        type: "button",
        label: "Team D",
        x: 66,
        y: 72,
        width: "28%",
        fontSize: 24,
        bgColor: "#3f3f46",
      },
    ],
  },

  orderConfirmation: {
    type: "orderConfirmation",
    title: "Order Confirmation",
    navLabel: "Order Confirmation",
    publicPath: "/order_confirmation",
    previewPath: "/preview/order_confirmation",
    aliases: ["/order-confirmation"],
    subtitle: "Simple confirmation page.",
    name: "Customer name",
    message: "Your order is confirmed.",
  },

  propBet: {
    type: "propBet",
    title: "Prop Bet",
    navLabel: "Prop Bet",
    publicPath: "/prop_bet",
    previewPath: "/preview/prop_bet",
    aliases: ["/prop-bet"],
    elements: [
      {
        id: "title",
        type: "text",
        text: "Prop Bet",
        x: 50,
        y: 14,
        fontSize: 44,
        color: "#ffffff",
        bgOpacity: 0,
      },
      {
        id: "question",
        type: "text",
        text: "Will Lakers score the next point?",
        x: 50,
        y: 34,
        width: "74%",
        fontSize: 44,
        color: "#ffffff",
        bgColor: "#000000",
        bgOpacity: 0.35,
      },
      {
        id: "yes",
        type: "button",
        label: "Yes +120",
        x: 38,
        y: 58,
        width: "26%",
        fontSize: 32,
        bgColor: "#059669",
      },
      {
        id: "no",
        type: "button",
        label: "No -140",
        x: 62,
        y: 58,
        width: "26%",
        fontSize: 32,
        bgColor: "#dc2626",
      },
      {
        id: "countdown",
        type: "countdown",
        x: 50,
        y: 80,
        seconds: 45,
      },
    ],
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
