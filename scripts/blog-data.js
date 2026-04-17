import { renderMarkdown } from "./markdown.js";
import { formatDate } from "./site.js";

let postIndexPromise;

// Helper function to filter out category tags (cat-*)
function getDisplayTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags.filter(tag => !tag.startsWith('cat-'));
}

function normalizePublishedPost(entry) {
  return {
    title: typeof entry?.title === "string" ? entry.title : "Untitled",
    slug: typeof entry?.slug === "string" ? entry.slug : "",
    summary: typeof entry?.summary === "string" ? entry.summary : "",
    author: typeof entry?.author === "string" ? entry.author : "",
    publishedAt: entry?.publishedAt || new Date(0).toISOString(),
    tags: Array.isArray(entry?.tags) ? entry.tags : [],
    draft: Boolean(entry?.draft),
    body: typeof entry?.body === "string" ? entry.body : "",
    file: typeof entry?.file === "string" ? entry.file : "",
  };
}

async function fetchPostIndex() {
  const response = await fetch("content/posts.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Could not load published blog posts.");
  }

  const entries = await response.json();
  if (!Array.isArray(entries)) {
    throw new Error("Published blog data is invalid.");
  }

  return entries.map(normalizePublishedPost);
}

export async function loadPostIndex() {
  if (!postIndexPromise) {
    postIndexPromise = fetchPostIndex().then((posts) =>
      posts
        .filter((post) => !post.draft)
        .sort((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt)),
    );
  }

  return postIndexPromise;
}

export async function loadPostBySlug(slug) {
  const index = await loadPostIndex();
  const post = index.find((entry) => entry.slug === slug);
  if (!post) {
    throw new Error("Post not found.");
  }

  return post;
}

export function renderPostCard(post) {
  const displayTags = getDisplayTags(post.tags);
  const tags = displayTags
    .slice(0, 3)
    .map((tag) => `<span class="tag">${tag}</span>`)
    .join("");

  return `
    <article class="post-card">
      <p class="meta-text">${formatDate(post.publishedAt)}</p>
      <h3>${post.title}</h3>
      <p>${post.summary}</p>
      <div class="tag-row">${tags}</div>
      <a class="post-link" href="post.html?slug=${encodeURIComponent(post.slug)}">Read post</a>
    </article>
  `;
}

export function renderPostListItem(post) {
  const displayTags = getDisplayTags(post.tags);
  const tags = displayTags.map((tag) => `<span class="tag">${tag}</span>`).join("");
  return `
    <article class="post-list-item">
      <p class="meta-text">${formatDate(post.publishedAt)}</p>
      <h2>${post.title}</h2>
      <p>${post.summary}</p>
      <div class="tag-row">${tags}</div>
      <a class="post-link" href="post.html?slug=${encodeURIComponent(post.slug)}">Open article</a>
    </article>
  `;
}

export function renderFullPost(post) {
  const displayTags = getDisplayTags(post.tags);
  const tags = displayTags.map((tag) => `<span class="tag">${tag}</span>`).join("");

  return `
    <header class="post-header">
      <p class="eyebrow">Blog Post</p>
      <h1>${post.title}</h1>
      <div class="post-meta">
        <span class="meta-text">${formatDate(post.publishedAt)}</span>
        <span class="meta-text">${post.author}</span>
      </div>
      <div class="tag-row">${tags}</div>
    </header>
    <div class="rich-copy">${renderMarkdown(post.body)}</div>
  `;
}
