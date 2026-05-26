import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const postsDir = path.join(projectRoot, "content", "posts");
const outputPath = path.join(projectRoot, "content", "posts.json");

function parseYamlScalar(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  if (trimmed === "true") {
    return true;
  }

  if (trimmed === "false") {
    return false;
  }

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => parseYamlScalar(item));
  }

  return trimmed;
}

function parseFrontMatter(markdown) {
  const normalized = markdown.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    return {
      data: {},
      body: normalized.trim(),
    };
  }

  const lines = normalized.split("\n");
  const closingIndex = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  if (closingIndex === -1) {
    return {
      data: {},
      body: normalized.trim(),
    };
  }

  const data = {};
  let index = 1;

  while (index < closingIndex) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!keyMatch) {
      index += 1;
      continue;
    }

    const key = keyMatch[1];
    const rest = keyMatch[2];

    if (!rest) {
      const items = [];
      index += 1;

      while (index < closingIndex && /^\s*-\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*-\s+/, ""));
        index += 1;
      }

      data[key] = items;
      continue;
    }

    data[key] = parseYamlScalar(rest);
    index += 1;
  }

  return {
    data,
    body: lines.slice(closingIndex + 1).join("\n").trim(),
  };
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizePost(markdown, fileName) {
  const { data, body } = parseFrontMatter(markdown);
  const fallbackSlug = slugify(fileName.replace(/\.md$/i, ""));
  const tags = Array.isArray(data.tags) ? data.tags : [];

  return {
    title: data.title || fileName.replace(/\.md$/i, ""),
    slug: data.slug ? slugify(data.slug) : fallbackSlug,
    summary: data.summary || "",
    author: data.author || "Sandip Munde",
    publishedAt: data.publishedAt || new Date(0).toISOString(),
    tags,
    draft: Boolean(data.draft),
    body,
    file: fileName,
  };
}

async function buildPostIndex() {
  const fileNames = await readdir(postsDir);
  const markdownFiles = fileNames.filter((fileName) => fileName.endsWith(".md")).sort();
  const posts = await Promise.all(
    markdownFiles.map(async (fileName) => {
      const filePath = path.join(postsDir, fileName);
      const markdown = await readFile(filePath, "utf8");
      return normalizePost(markdown, fileName);
    }),
  );

  return posts.sort((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt));
}

const posts = await buildPostIndex();
await writeFile(outputPath, `${JSON.stringify(posts, null, 2)}\n`, "utf8");

console.log(`Wrote ${posts.length} posts to ${path.relative(projectRoot, outputPath)}.`);
