# AWS Deployment

This Vite app builds to static files in `dist/`.

```bash
npm run build
```

## Option A: AWS Amplify Hosting

1. Connect the repository in Amplify.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add SPA rewrite:

```text
Source address: </^[^.]+$|\.(?!(css|gif|ico|jpg|jpeg|js|png|svg|txt|webp|mp4|webm)$)([^.]+$)/>
Target address: /index.html
Type: 200 (Rewrite)
```

## Option B: S3 + CloudFront

1. Create an S3 bucket for static hosting.
2. Upload `dist/` contents to the bucket.
3. Put CloudFront in front of the bucket.
4. Configure custom error responses:

```text
HTTP error code: 403
Response page path: /index.html
HTTP response code: 200
```

```text
HTTP error code: 404
Response page path: /index.html
HTTP response code: 200
```

These rules let direct route refreshes work for:

- `/challenge`
- `/trivia`
- `/order_confirmation`
- `/prop_bet`

## Assets

Static assets should be placed under `public/`.

- `public/images/tequila.jpg` is available as `/images/tequila.jpg`
- `public/videos/challenge.mp4` is available as `/videos/challenge.mp4`
