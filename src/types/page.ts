export type PageType =
  | "challenge"
  | "trivia"
  | "orderConfirmation"
  | "propBet";

export type ElementAlign = "left" | "center" | "right";

export type PageBackground = {
  type: "image" | "video" | "color";
  src?: string;
  color?: string;
  storageId?: string;
  name?: string;
};

export type ElementBase = {
  id?: string;
  x?: number;
  y?: number;
  width?: number | string;
  height?: number | string;
  zIndex?: number;
  className?: string;
};

export type TextElement = ElementBase & {
  type: "text";
  text: string;
  fontSize?: number;
  color?: string;
  align?: ElementAlign;
  fontFamily?: string;
  fontWeight?: number;
  bgColor?: string;
  bgOpacity?: number;
};

export type CountdownElement = ElementBase & {
  type: "countdown";
  seconds: number;
  size?: number;
  color?: string;
  bgColor?: string;
  borderColor?: string;
};

export type ImageElement = ElementBase & {
  type: "image";
  src?: string;
  storageId?: string;
  name?: string;
  alt?: string;
  opacity?: number;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: "solid" | "dashed" | "dotted" | "double";
  borderRadius?: number;
};

export type VideoElement = ElementBase & {
  type: "video";
  src?: string;
  storageId?: string;
  name?: string;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: "solid" | "dashed" | "dotted" | "double";
  borderRadius?: number;
};

export type ButtonElement = ElementBase & {
  type: "button";
  label: string;
  href?: string;
  fontSize?: number;
  color?: string;
  bgColor?: string;
  borderRadius?: number;
};

export type CardElement = ElementBase & {
  type: "card";
  title?: string;
  body?: string;
};

export type InteractiveElement =
  | TextElement
  | CountdownElement
  | ImageElement
  | VideoElement
  | ButtonElement
  | CardElement;

export type InteractivePageConfig = {
  slug?: string;
  type: PageType;
  title: string;
  navLabel?: string;
  publicPath?: string;
  previewPath?: string;
  aliases?: string[];
  subtitle?: string;
  background?: PageBackground;
  backgroundImage?: string;
  backgroundVideo?: string;
  image?: string;
  video?: string;
  elements?: InteractiveElement[];
  overlayText?: string;
  x?: number;
  y?: number;
  align?: ElementAlign;
  fontSize?: number;
  fontColor?: string;
  fontFamily?: string;
  bgColor?: string;
  bgOpacity?: number;
  countdown?: number;
  question?: string;
  options?: string[];
  message?: string;
  name?: string;
  yesLabel?: string;
  noLabel?: string;
};
