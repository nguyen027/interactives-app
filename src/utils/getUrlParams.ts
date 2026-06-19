// Parses supported legacy query parameters into typed renderer overrides.
export function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  // Converts a numeric query value while ignoring missing or invalid inputs.
  const numberParam = (key: string) => {
    const value = params.get(key);
    if (!value) return undefined;

    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  return {
    text: params.get("text") || undefined,
    title: params.get("title") || undefined,
    subtitle: params.get("subtitle") || undefined,
    image: params.get("image") || undefined,
    video: params.get("video") || undefined,
    countdown: numberParam("countdown"),
    question: params.get("question") || undefined,
    name: params.get("name") || undefined,
    message: params.get("message") || undefined,
    x: numberParam("x"),
    y: numberParam("y"),
    align:
      params.get("align") === "left" ||
      params.get("align") === "center" ||
      params.get("align") === "right"
        ? (params.get("align") as "left" | "center" | "right")
        : undefined,
    fontSize: numberParam("fontSize"),
    color: params.get("color") || undefined,
    fontColor: params.get("fontColor") || params.get("color") || undefined,
    fontFamily: params.get("fontFamily") || undefined,
    bgColor: params.get("bgColor") || undefined,
    bgOpacity: numberParam("bgOpacity"),
    a: params.get("a") || undefined,
    b: params.get("b") || undefined,
    c: params.get("c") || undefined,
    d: params.get("d") || undefined,
    yes: params.get("yes") || undefined,
    no: params.get("no") || undefined,
  };
}
