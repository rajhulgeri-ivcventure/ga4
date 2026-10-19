# supersave website

A lightweight static SaaS landing site with Google Analytics 4 tracking, responsive design, and PWA support.

## Local preview

Open the project in a browser via a local server, for example:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Google Analytics

The site keeps the existing measurement ID: `G-EP7L5BW48Z`. It is configured in each page with `gtag('config', 'G-EP7L5BW48Z')`.

## PWA

The app includes a web manifest and a service worker. Install support depends on the browser.

## Vercel deployment

This project is static and works well on Vercel without a framework build step.

1. Push this folder to GitHub.
2. Go to Vercel and import the repository.
3. Keep the default settings for a static site.
4. Deploy.

The included `vercel.json` file helps keep routes clean and static-friendly.

## Notes

- This frontend is intentionally static and is ready for a real backend or auth provider.
- Authentication and checkout are shown as demo-ready flows without making false claims.
