import { loadPostBySlug, renderFullPost } from "./blog-data.js";
import { initSite, setStatus } from "./site.js";

const MAX_MATH_RENDER_WAIT_MS = 4000;

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function renderMath(container) {
  const deadline = Date.now() + MAX_MATH_RENDER_WAIT_MS;
  while (typeof window.renderMathInElement !== "function" && Date.now() < deadline) {
    await wait(50);
  }

  if (typeof window.renderMathInElement !== "function") {
    console.warn("KaTeX auto-render did not load; leaving math as plain text.");
    return;
  }

  window.renderMathInElement(container, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false },
      { left: "\\(", right: "\\)", display: false },
      { left: "\\[", right: "\\]", display: true },
    ],
    throwOnError: false,
  });
}

async function initPostPage() {
  initSite("");

  const status = document.getElementById("post-status");
  const container = document.getElementById("post-view");
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    setStatus(status, "No blog post was specified.", "error");
    return;
  }

  try {
    const post = await loadPostBySlug(slug);
    document.title = `${post.title} | Dr. Aidin Jalilzadeh`;
    container.innerHTML = renderFullPost(post);
    await renderMath(container);
  } catch (error) {
    setStatus(status, error.message, "error");
  }
}

initPostPage();
