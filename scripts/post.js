import { loadPostBySlug, renderFullPost } from "./blog-data.js";
import { initSite, setStatus } from "./site.js";

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
  } catch (error) {
    console.error(error);
    setStatus(status, error.message, "error");
  }
}

initPostPage();
