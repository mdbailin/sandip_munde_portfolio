# Sandip Munde Portfolio

Static academic portfolio designed for GitHub Pages with TinaCMS-backed blog authoring.

## Included pages

- `index.html`: home page with Sandip's profile photo, resume content, and resume download.
- `videos.html`: latest uploads from a configured YouTube channel.
- `blog.html`: public blog index.
- `post.html`: individual post reader.
- `admin/`: TinaCMS admin app generated during deployment when Tina secrets are configured.
- `content/posts.json`: generated blog index used by the public site.

## GitHub Pages deployment

The included `.github/workflows/deploy-pages.yml` workflow builds the published blog index, builds the TinaCMS admin app, and deploys the site to GitHub Pages.

In GitHub, open `Settings > Pages` and set the source to `GitHub Actions`.

If the repo name changes, update `scripts/config.js`:

```js
github: {
  owner: "mdbailin",
  repo: "sandip_munde_portfolio",
  branch: "main",
  contentDir: "content/posts",
}
```

## YouTube feed setup

Add Sandip's YouTube channel details in `scripts/config.js`:

```js
youtube: {
  channelId: "YOUR_CHANNEL_ID",
  channelUrl: "https://www.youtube.com/@yourhandle",
}
```

The videos page uses the public channel RSS feed and renders the latest uploads. If no channel is configured, it shows a setup message.

## Blog authoring with TinaCMS

Blog authoring happens through TinaCMS, which provides an authenticated editing flow and writes Markdown content back to the GitHub repository.

Relevant repo files:

- `tina/config.ts`
- `content/posts/*.md`
- `content/posts.json`
- `.github/workflows/deploy-pages.yml`

The public blog pages read `content/posts.json`, a generated file built from Markdown posts during local development and GitHub Pages deployment.

Recommended TinaCloud setup:

1. Create a TinaCloud project connected to `mdbailin/sandip_munde_portfolio`.
2. Copy the TinaCloud `clientId` and read/write token.
3. Add GitHub repository secrets:
   - `TINA_PUBLIC_CLIENT_ID`
   - `TINA_TOKEN`
4. Open `/admin/` on the deployed site and sign in through Tina.

Each blog post is a Markdown file with front matter in `content/posts/`, for example:

```md
---
title: Example Title
summary: A short summary for blog listing pages.
author: Sandip Munde
publishedAt: 2026-03-23T00:00:00.000Z
tags:
  - research
  - notes
---

# Example Title

Post body here.
```

## Local Tina development

Install dependencies:

```bash
npm install
```

Run the local site together with Tina:

```bash
npm run dev
```

Regenerate the published blog index without starting the dev server:

```bash
npm run build:posts
```

If TinaCloud credentials are not configured locally, the public site still works, but authenticated Tina editing requires the TinaCloud project and repository secrets above.

## Local preview

Serve the folder with a small static server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
