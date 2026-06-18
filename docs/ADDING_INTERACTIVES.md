# Adding Interactives

The app is config-driven. Add or edit pages in `src/config/pages.ts`.

## Page Shape

Each public page uses:

```ts
{
  type: "challenge",
  title: "Challenge",
  navLabel: "Challenge",
  publicPath: "/challenge",
  previewPath: "/preview/challenge",
  backgroundImage: "/images/sample.jpg",
  backgroundVideo: "/videos/challenge.mp4",
  elements: []
}
```

Use either `backgroundImage` or `backgroundVideo`. URL params `image` and `video` override those values.

## Element Types

Supported `elements[]` types:

- `text`
- `countdown`
- `image`
- `video`
- `button`
- `card`

Example:

```ts
elements: [
  {
    id: "name",
    type: "text",
    text: "DERRICK & JENETTE",
    x: 58,
    y: 43,
    fontSize: 96,
    color: "#ffffff",
    bgColor: "#000000",
    bgOpacity: 0.25,
  },
  {
    id: "countdown",
    type: "countdown",
    x: 86,
    y: 80,
    seconds: 225,
  },
]
```

`x` and `y` are percentages of the screen and currently represent the element center point.

## URL Overrides

Simple first-element overrides:

- `text`
- `x`
- `y`
- `align`
- `fontSize`
- `fontColor`
- `fontFamily`
- `bgColor`
- `bgOpacity`
- `countdown`
- `image`
- `video`

Indexed text overrides:

- `text1`, `text2`, `text3`
- `x1`, `x2`, `x3`
- `y1`, `y2`, `y3`
- `align1`, `align2`
- `fontSize1`, `fontSize2`
- `fontColor1`, `fontColor2`
- `fontFamily1`, `fontFamily2`
- `bgColor1`, `bgColor2`
- `bgOpacity1`, `bgOpacity2`

Countdown overrides:

- `countdown`
- `countdown1`, `countdown2`
- `xCountdown1`, `yCountdown1`

Semantic overrides:

- `name` overrides a text element with `id: "name"`
- `message` overrides a text element with `id: "message"`
- `question` overrides a text element with `id: "question"`
- `a`, `b`, `c`, `d` override buttons with IDs `option-a` through `option-d`
- `yes`, `no` override buttons with IDs `yes` and `no`

## Add a New Page

1. Add a key to `pageKeys`.
2. Add a config object to `pages`.
3. Set `publicPath` and `previewPath`.
4. Add `elements[]`.

Routes and preview navigation are generated from config.
