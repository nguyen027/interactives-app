# Interactives App

React + Tailwind SPA for fullscreen interactive pages driven by URL params and config.

## Routes

Public fullscreen routes:

- `/challenge`
- `/trivia`
- `/order_confirmation`
- `/prop_bet`

Internal preview routes:

- `/preview`
- `/preview/challenge`
- `/preview/trivia`
- `/preview/order_confirmation`
- `/preview/prop_bet`

## Example URLs

```text
/challenge?video=/videos/challenge.mp4&text=Coach%20Challenge&countdown=345
/challenge?image=/images/sample.jpg&text=Derrick%20%26%20Jenette&x=50&y=35&fontSize=64
/order_confirmation?text2=DERRICK%20%26%20JENETTE&text3=YOUR%20ORDER%20IS%20ON%20THE%20WAY&countdown=225
/trivia?question=Who%20won%20the%20game&a=Lakers&b=Celtics&c=Bulls&d=Heat
/prop_bet?question=Will%20Lakers%20score%20next?&yes=Yes%20%2B120&no=No%20-140&countdown=45
```

## Development

```bash
npm install
npm run dev
npm run build
```

Assets in `public/` are served from the site root. For example:

- `public/images/sample.jpg` becomes `/images/sample.jpg`
- `public/videos/challenge.mp4` becomes `/videos/challenge.mp4`

See [docs/ADDING_INTERACTIVES.md](docs/ADDING_INTERACTIVES.md) for adding pages and [docs/AWS_DEPLOY.md](docs/AWS_DEPLOY.md) for deployment.
