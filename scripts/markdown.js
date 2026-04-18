function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseInline(text) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function renderParagraph(text) {
  return `<p>${parseInline(text)}</p>`;
}

function renderList(items, ordered) {
  const tag = ordered ? "ol" : "ul";
  const rendered = items.map((item) => `<li>${parseInline(item)}</li>`).join("");
  return `<${tag}>${rendered}</${tag}>`;
}

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

export function parseFrontMatter(markdown) {
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

export function renderMarkdown(markdown) {
  if (!markdown || !markdown.trim()) {
    return "<p>No content yet.</p>";
  }

  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const buffer = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        buffer.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(`<pre><code>${escapeHtml(buffer.join("\n"))}</code></pre>`);
      continue;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      blocks.push(`<h${level}>${parseInline(headingMatch[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      const quoteLines = [];
      while (index < lines.length && lines[index].startsWith("> ")) {
        quoteLines.push(lines[index].slice(2));
        index += 1;
      }
      blocks.push(`<blockquote>${quoteLines.map(parseInline).join("<br />")}</blockquote>`);
      continue;
    }

    const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      const items = [];
      while (index < lines.length) {
        const itemMatch = lines[index].match(/^\d+\.\s+(.*)$/);
        if (!itemMatch) {
          break;
        }
        items.push(itemMatch[1]);
        index += 1;
      }
      blocks.push(renderList(items, true));
      continue;
    }

    if (line.startsWith("- ")) {
      const items = [];
      while (index < lines.length && lines[index].startsWith("- ")) {
        items.push(lines[index].slice(2));
        index += 1;
      }
      blocks.push(renderList(items, false));
      continue;
    }

    const paragraphLines = [];
    while (index < lines.length && lines[index].trim()) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }
    blocks.push(renderParagraph(paragraphLines.join(" ")));
  }

  return blocks.join("\n");
}

export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
