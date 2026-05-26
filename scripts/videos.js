import SITE_CONFIG from "./config.js";
import { hideStatus, initSite, setStatus } from "./site.js";

function getVideoId(link) {
  try {
    const url = new URL(link);
    return url.searchParams.get("v");
  } catch {
    return "";
  }
}

function renderVideoCard(video) {
  const videoId = getVideoId(video.link);
  const publishedAt = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(video.pubDate));

  return `
    <article class="video-card">
      <iframe
        src="https://www.youtube.com/embed/${videoId}"
        title="${video.title}"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>
      <p class="meta-text">${publishedAt}</p>
      <h3>${video.title}</h3>
      <p>${video.description || "Recent upload from the configured YouTube channel."}</p>
      <a class="post-link" href="${video.link}" target="_blank" rel="noreferrer">Watch on YouTube</a>
    </article>
  `;
}

async function initVideosPage() {
  initSite("videos.html");

  const status = document.getElementById("video-status");
  const grid = document.getElementById("video-grid");

  if (!SITE_CONFIG.youtube.channelId) {
    setStatus(
      status,
      "Add Sandip's YouTube channel ID in scripts/config.js to load the latest ten uploads.",
    );
    return;
  }

  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(
    SITE_CONFIG.youtube.channelId,
  )}`;
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Could not reach the YouTube feed.");
    }

    const payload = await response.json();
    if (payload.status !== "ok") {
      throw new Error("The YouTube feed returned an invalid response.");
    }

    hideStatus(status);
    grid.innerHTML = payload.items.slice(0, 10).map(renderVideoCard).join("");
  } catch (error) {
    const fallbackUrl = SITE_CONFIG.youtube.channelUrl || "https://www.youtube.com/";
    status.classList.remove("status-success", "is-hidden");
    status.classList.add("status-error");
    status.innerHTML = `${error.message} Use the channel link instead: <a class="footer-link" href="${fallbackUrl}" target="_blank" rel="noreferrer">${fallbackUrl}</a>`;
  }
}

initVideosPage();
