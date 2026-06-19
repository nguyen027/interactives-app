import { useEffect, useRef, useState } from "react";
import BackgroundRenderer from "./BackgroundRenderer";
import Card from "./Card";
import Countdown from "./Countdown";
import PageHeader from "./PageHeader";
import ScaledArtboard from "./ScaledArtboard";
import { renderInteractiveElement } from "./interactiveRenderHelpers";
import type { InteractiveElement, InteractivePageConfig } from "../types/page";
import { getUrlParams } from "../utils/getUrlParams";

type InteractiveRendererProps = {
  page: InteractivePageConfig;
  mode?: "public" | "preview";
};

// Reads a numeric query parameter and ignores invalid values.
function getNumberParam(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);
  if (!value) return undefined;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

// Reads a text alignment query parameter only when it matches supported values.
function getAlignParam(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);

  if (value === "left" || value === "center" || value === "right") {
    return value;
  }

  return undefined;
}

// Builds URL-driven overrides for one text element.
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

// Finds URL-driven labels for configured button elements.
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

// Applies supported URL query overrides to configured page elements.
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

// Provides fullscreen controls for public interactive pages.
function FullscreenButton({
  targetRef,
}: {
  targetRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isSupported = document.fullscreenEnabled;

  // Tracks whether this renderer shell is the current fullscreen element.
  useEffect(() => {
    const updateFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === targetRef.current);
    };

    document.addEventListener("fullscreenchange", updateFullscreenState);

    return () => {
      document.removeEventListener("fullscreenchange", updateFullscreenState);
    };
  }, [targetRef]);

  if (!isSupported) return null;

  // Enters or exits fullscreen for the renderer shell.
  const toggleFullscreen = async () => {
    const target = targetRef.current;
    if (!target) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await target.requestFullscreen();
  };

  return (
    <button
      type="button"
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      onClick={() => void toggleFullscreen()}
      className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/45 text-white shadow-xl backdrop-blur transition hover:bg-black/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      >
        {isFullscreen ? (
          <>
            <path d="M8 3v5H3" />
            <path d="M16 3v5h5" />
            <path d="M8 21v-5H3" />
            <path d="M16 21v-5h5" />
          </>
        ) : (
          <>
            <path d="M3 9V3h6" />
            <path d="M21 9V3h-6" />
            <path d="M3 15v6h6" />
            <path d="M21 15v6h-6" />
          </>
        )}
      </svg>
    </button>
  );
}

// Renders an interactive page using configured elements or legacy page layouts.
export default function InteractiveRenderer({
  page,
  mode = "public",
}: InteractiveRendererProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const params = getUrlParams();
  const isPublic = mode === "public";
  const useLegacyUrlParams = page.type !== "challenge";

  const title = useLegacyUrlParams ? params.title || page.title : page.title;
  const subtitle = useLegacyUrlParams
    ? params.subtitle || page.subtitle
    : page.subtitle;
  const image = useLegacyUrlParams
    ? params.image || page.backgroundImage || page.image || undefined
    : page.backgroundImage || page.image || undefined;
  const video = useLegacyUrlParams
    ? params.video || page.backgroundVideo || page.video || undefined
    : page.backgroundVideo || page.video || undefined;
  const countdown = useLegacyUrlParams
    ? params.countdown ?? page.countdown
    : page.countdown;
  const question = useLegacyUrlParams
    ? params.question || page.question
    : page.question;
  const message = useLegacyUrlParams ? params.message || page.message : page.message;
  const name = params.name || page.name;
  const options = useLegacyUrlParams
    ? ([params.a, params.b, params.c, params.d].filter(Boolean) as string[])
    : [];
  const finalOptions = options.length ? options : page.options;
  const yesLabel = useLegacyUrlParams ? params.yes || page.yesLabel : page.yesLabel;
  const noLabel = useLegacyUrlParams ? params.no || page.noLabel : page.noLabel;
  const hasMedia = Boolean(page.background || image || video);
  const hasElementList = Array.isArray(page.elements);
  const configuredElements = page.elements ?? [];
  const fallbackElements: InteractiveElement[] = [];

  if (!hasElementList && (params.text || page.overlayText)) {
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

  if (!hasElementList && countdown !== undefined && countdown > 0) {
    fallbackElements.push({
      type: "countdown",
      x: 90,
      y: 86,
      seconds: countdown,
    });
  }

  const elements = useLegacyUrlParams
    ? mergeUrlOverrides(hasElementList ? configuredElements : fallbackElements)
    : hasElementList
      ? configuredElements
      : fallbackElements;

  const shellClass = [
    "relative overflow-hidden bg-zinc-900 text-white",
    isPublic ? "h-screen w-screen" : "h-full w-full",
  ].join(" ");

  const contentClass = [
    "relative z-10 h-full w-full",
    hasMedia ? "bg-black/35" : "",
  ].join(" ");

  if (hasElementList || elements.length > 0) {
    return (
      <div ref={shellRef} className={shellClass}>
        <BackgroundRenderer background={page.background} image={image} video={video} />
        <ScaledArtboard>{elements.map(renderInteractiveElement)}</ScaledArtboard>
        {isPublic && <FullscreenButton targetRef={shellRef} />}
      </div>
    );
  }

  if (page.type === "welcome") {
    return (
      <div className={shellClass}>
        {hasMedia && (
          <BackgroundRenderer background={page.background} image={image} video={video} />
        )}
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
        {hasMedia && (
          <BackgroundRenderer background={page.background} image={image} video={video} />
        )}
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
        {hasMedia && (
          <BackgroundRenderer background={page.background} image={image} video={video} />
        )}
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
      {hasMedia && (
        <BackgroundRenderer background={page.background} image={image} video={video} />
      )}
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
