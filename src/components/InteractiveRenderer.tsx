import type { CSSProperties } from "react";
import Card from "./Card";
import Countdown from "./Countdown";
import MediaBackground from "./MediaBackground";
import OverlayText from "./OverlayText";
import PageHeader from "./PageHeader";
import type { InteractiveElement, InteractivePageConfig } from "../types/page";
import { getUrlParams } from "../utils/getUrlParams";

type InteractiveRendererProps = {
  page: InteractivePageConfig;
  mode?: "public" | "preview";
};

function clampOpacity(value: number | undefined) {
  if (value === undefined) return 0.45;

  return Math.min(Math.max(value, 0), 1);
}

function getOverlayBackground(color = "#000000", opacity?: number) {
  const alpha = clampOpacity(opacity);

  if (alpha === 0) return "transparent";

  if (color.startsWith("rgba(") || color.startsWith("rgb(")) {
    return color;
  }

  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const normalized =
      hex.length === 3
        ? hex
            .split("")
            .map((char) => `${char}${char}`)
            .join("")
        : hex;

    if (normalized.length === 6) {
      const red = parseInt(normalized.slice(0, 2), 16);
      const green = parseInt(normalized.slice(2, 4), 16);
      const blue = parseInt(normalized.slice(4, 6), 16);

      return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }
  }

  return `color-mix(in srgb, ${color} ${alpha * 100}%, transparent)`;
}

function getSize(value: number | string | undefined) {
  if (typeof value === "number") return `${value}px`;

  return value;
}

function getPositionStyle(element: InteractiveElement): CSSProperties {
  return {
    position: "absolute",
    left: `${element.x ?? 50}%`,
    top: `${element.y ?? 50}%`,
    width: getSize(element.width),
    height: getSize(element.height),
    transform: "translate(-50%, -50%)",
    zIndex: element.zIndex ?? 10,
  };
}

function getNumberParam(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);
  if (!value) return undefined;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function getAlignParam(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);

  if (value === "left" || value === "center" || value === "right") {
    return value;
  }

  return undefined;
}

function getTextOverride(
  element: InteractiveElement,
  searchParams: URLSearchParams,
  index: number,
) {
  if (element.type !== "text") return {};

  const id = element.id;
  const semanticText =
    id === "name"
      ? searchParams.get("name")
      : id === "message"
        ? searchParams.get("message")
        : id === "question"
          ? searchParams.get("question")
          : id === "title"
            ? searchParams.get("title")
            : undefined;

  return {
    text:
      searchParams.get(`text${index}`) ||
      semanticText ||
      (index === 1 ? searchParams.get("text") : undefined) ||
      element.text,
    x:
      getNumberParam(searchParams, `x${index}`) ??
      (index === 1 ? getNumberParam(searchParams, "x") : undefined) ??
      element.x,
    y:
      getNumberParam(searchParams, `y${index}`) ??
      (index === 1 ? getNumberParam(searchParams, "y") : undefined) ??
      element.y,
    align:
      getAlignParam(searchParams, `align${index}`) ??
      (index === 1 ? getAlignParam(searchParams, "align") : undefined) ??
      element.align,
    fontSize:
      getNumberParam(searchParams, `fontSize${index}`) ??
      (index === 1 ? getNumberParam(searchParams, "fontSize") : undefined) ??
      element.fontSize,
    color:
      searchParams.get(`fontColor${index}`) ||
      searchParams.get(`color${index}`) ||
      (index === 1
        ? searchParams.get("fontColor") || searchParams.get("color")
        : undefined) ||
      element.color,
    fontFamily:
      searchParams.get(`fontFamily${index}`) ||
      (index === 1 ? searchParams.get("fontFamily") : undefined) ||
      element.fontFamily,
    bgColor:
      searchParams.get(`bgColor${index}`) ||
      (index === 1 ? searchParams.get("bgColor") : undefined) ||
      element.bgColor,
    bgOpacity:
      getNumberParam(searchParams, `bgOpacity${index}`) ??
      (index === 1 ? getNumberParam(searchParams, "bgOpacity") : undefined) ??
      element.bgOpacity,
  };
}

function getButtonLabelOverride(
  element: InteractiveElement,
  searchParams: URLSearchParams,
  index: number,
) {
  if (element.type !== "button") return undefined;

  if (element.id === "option-a") return searchParams.get("a") || undefined;
  if (element.id === "option-b") return searchParams.get("b") || undefined;
  if (element.id === "option-c") return searchParams.get("c") || undefined;
  if (element.id === "option-d") return searchParams.get("d") || undefined;
  if (element.id === "yes") return searchParams.get("yes") || undefined;
  if (element.id === "no") return searchParams.get("no") || undefined;

  return searchParams.get(`button${index}`) || undefined;
}

function mergeUrlOverrides(elements: InteractiveElement[]) {
  const params = getUrlParams();
  const searchParams = new URLSearchParams(window.location.search);
  let textIndex = 0;
  let countdownIndex = 0;
  let buttonIndex = 0;
  let imageIndex = 0;
  let videoIndex = 0;

  return elements.map((element) => {
    if (element.type === "text") {
      textIndex += 1;

      return {
        ...element,
        ...getTextOverride(element, searchParams, textIndex),
      };
    }

    if (element.type === "countdown") {
      countdownIndex += 1;

      return {
        ...element,
        seconds:
          getNumberParam(searchParams, `countdown${countdownIndex}`) ??
          (countdownIndex === 1 ? params.countdown : undefined) ??
          element.seconds,
        x:
          getNumberParam(searchParams, `xCountdown${countdownIndex}`) ??
          element.x,
        y:
          getNumberParam(searchParams, `yCountdown${countdownIndex}`) ??
          element.y,
      };
    }

    if (element.type === "button") {
      buttonIndex += 1;

      return {
        ...element,
        label:
          getButtonLabelOverride(element, searchParams, buttonIndex) ??
          element.label,
        x:
          getNumberParam(searchParams, `xButton${buttonIndex}`) ??
          element.x,
        y:
          getNumberParam(searchParams, `yButton${buttonIndex}`) ??
          element.y,
      };
    }

    if (element.type === "image") {
      imageIndex += 1;

      return {
        ...element,
        src: searchParams.get(`image${imageIndex}`) || element.src,
      };
    }

    if (element.type === "video") {
      videoIndex += 1;

      return {
        ...element,
        src: searchParams.get(`video${videoIndex}`) || element.src,
      };
    }

    return element;
  });
}

function renderElement(element: InteractiveElement) {
  const key = element.id || `${element.type}-${element.x}-${element.y}`;

  if (element.type === "text") {
    return (
      <OverlayText
        key={key}
        text={element.text}
        x={element.x}
        y={element.y}
        width={getSize(element.width)}
        height={getSize(element.height)}
        align={element.align}
        fontSize={element.fontSize}
        color={element.color}
        fontFamily={element.fontFamily}
        background={getOverlayBackground(element.bgColor, element.bgOpacity)}
      />
    );
  }

  if (element.type === "countdown") {
    return (
      <div key={key} className={element.className} style={getPositionStyle(element)}>
        <Countdown seconds={element.seconds} />
      </div>
    );
  }

  if (element.type === "image") {
    return (
      <img
        key={key}
        src={element.src}
        alt={element.alt || ""}
        className={element.className}
        style={{
          ...getPositionStyle(element),
          opacity: element.opacity,
          objectFit: "contain",
        }}
      />
    );
  }

  if (element.type === "video") {
    return (
      <video
        key={key}
        src={element.src}
        autoPlay
        muted
        loop
        playsInline
        className={element.className}
        style={{ ...getPositionStyle(element), objectFit: "cover" }}
      />
    );
  }

  if (element.type === "button") {
    return (
      <a
        key={key}
        href={element.href}
        className={[
          "rounded-2xl px-6 py-4 text-center font-bold shadow-xl transition hover:scale-105",
          element.className || "",
        ].join(" ")}
        style={{
          ...getPositionStyle(element),
          color: element.color || "#ffffff",
          background: element.bgColor || "#7c3aed",
          fontSize: element.fontSize,
          width: getSize(element.width),
        }}
      >
        {element.label}
      </a>
    );
  }

  return (
    <div key={key} style={getPositionStyle(element)}>
      <Card className={element.className || ""}>
        {element.title && <h3 className="text-2xl font-bold">{element.title}</h3>}
        {element.body && <p className="mt-3 text-zinc-300">{element.body}</p>}
      </Card>
    </div>
  );
}

export default function InteractiveRenderer({
  page,
  mode = "public",
}: InteractiveRendererProps) {
  const params = getUrlParams();
  const isPublic = mode === "public";

  const title = params.title || page.title;
  const subtitle = params.subtitle || page.subtitle;
  const image =
    params.image || page.backgroundImage || page.image || undefined;
  const video =
    params.video || page.backgroundVideo || page.video || undefined;
  const countdown = params.countdown ?? page.countdown;
  const question = params.question || page.question;
  const message = params.message || page.message;
  const name = params.name || page.name;
  const options = [params.a, params.b, params.c, params.d].filter(
    Boolean,
  ) as string[];
  const finalOptions = options.length ? options : page.options;
  const yesLabel = params.yes || page.yesLabel;
  const noLabel = params.no || page.noLabel;
  const hasMedia = Boolean(image || video);
  const configuredElements = page.elements || [];
  const fallbackElements: InteractiveElement[] = [];

  if (!configuredElements.length && (params.text || page.overlayText)) {
    fallbackElements.push({
      type: "text",
      text: params.text || page.overlayText || "",
      x: params.x ?? page.x ?? 50,
      y: params.y ?? page.y ?? 50,
      align: params.align ?? page.align ?? "center",
      fontSize: params.fontSize ?? page.fontSize ?? 48,
      color: params.fontColor ?? page.fontColor ?? "#ffffff",
      fontFamily: params.fontFamily ?? page.fontFamily,
      bgColor: params.bgColor ?? page.bgColor,
      bgOpacity: params.bgOpacity ?? page.bgOpacity,
    });
  }

  if (!configuredElements.length && countdown !== undefined && countdown > 0) {
    fallbackElements.push({
      type: "countdown",
      x: 90,
      y: 86,
      seconds: countdown,
    });
  }

  const elements = mergeUrlOverrides(
    configuredElements.length ? configuredElements : fallbackElements,
  );

  const shellClass = [
    "relative overflow-hidden bg-zinc-900 text-white",
    isPublic ? "h-screen w-screen" : "h-full w-full",
  ].join(" ");

  const contentClass = [
    "relative z-10 h-full w-full",
    hasMedia ? "bg-black/35" : "",
  ].join(" ");

  if (elements.length > 0) {
    return (
      <div className={shellClass}>
        <MediaBackground image={image} video={video} />
        {elements.map(renderElement)}
      </div>
    );
  }

  if (page.type === "welcome") {
    return (
      <div className={shellClass}>
        {hasMedia && <MediaBackground image={image} video={video} />}
        <div className={`${contentClass} p-8`}>
          <PageHeader title={title} subtitle={subtitle} />

          <Card>
            <h3 className="text-2xl font-bold">Interactive Platform</h3>
            <p className="mt-3 text-zinc-300">{message}</p>
          </Card>
        </div>
      </div>
    );
  }

  if (page.type === "trivia") {
    return (
      <div className={shellClass}>
        {hasMedia && <MediaBackground image={image} video={video} />}
        <div className={`${contentClass} p-8`}>
          <PageHeader title={title} subtitle={subtitle} />

          <Card>
            <h3 className="text-3xl font-bold">{question}</h3>

            <div className="mt-6 grid grid-cols-2 gap-4">
              {finalOptions?.map((option) => (
                <button
                  key={option}
                  className="rounded-2xl bg-zinc-700 p-5 text-left text-xl font-semibold hover:bg-violet-600"
                >
                  {option}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (page.type === "orderConfirmation") {
    return (
      <div className={shellClass}>
        {hasMedia && <MediaBackground image={image} video={video} />}
        <div className={`${contentClass} p-8`}>
          <PageHeader title={title} subtitle={subtitle} />

          <Card className="max-w-xl">
            <p className="text-lg text-zinc-300">{name}</p>
            <h3 className="mt-3 text-4xl font-bold">{message}</h3>

            {countdown !== undefined && countdown > 0 && (
              <div className="mt-8">
                <Countdown seconds={countdown} />
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      {hasMedia && <MediaBackground image={image} video={video} />}
      <div className={`${contentClass} p-8`}>
        <PageHeader title={title} subtitle={subtitle} />

        <Card className="max-w-2xl">
          <h3 className="text-3xl font-bold">{question}</h3>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button className="rounded-2xl bg-emerald-600 p-6 text-2xl font-bold">
              {yesLabel}
            </button>

            <button className="rounded-2xl bg-red-600 p-6 text-2xl font-bold">
              {noLabel}
            </button>
          </div>

          {countdown !== undefined && countdown > 0 && (
            <div className="mt-8">
              <Countdown seconds={countdown} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
