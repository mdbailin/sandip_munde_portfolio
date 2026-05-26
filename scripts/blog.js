import { loadPostIndex, renderPostListItem } from "./blog-data.js";
import { initSite } from "./site.js";

async function initBlogPage() {
  initSite("blog.html");

  const blogList = document.getElementById("blog-list");
  
  const params = new URLSearchParams(window.location.search);
  const filterTag = params.get("tag");

  // Customize header based on tag
  const headerConfig = {
    'education': {
      eyebrow: 'Middle Years Programme',
      title: 'IB MYP',
      description: 'Coordination, curriculum alignment, ATL skills, interdisciplinary learning, and assessment readiness in the IB Middle Years Programme.'
    }
  };

  const categories = [
    { tag: 'education', label: 'IB MYP' }
  ];

  const navHtml = `
    <div class="category-nav">
      ${categories.map(cat => `
        <a href="blog.html?tag=${cat.tag}" class="category-btn ${filterTag === cat.tag ? 'active' : ''}">
          ${cat.label}
        </a>
      `).join('')}
    </div>
  `;

  const defaultConfig = {
    eyebrow: 'Blog',
    title: 'IB MYP Writing',
    description: 'Essays and practical reflections on IB MYP leadership, curriculum, and student learning.'
  };

  const config = headerConfig[filterTag] || defaultConfig;

  const eyebrowEl = document.getElementById('dynamic-eyebrow');
  const titleEl = document.getElementById('dynamic-title');
  const descEl = document.getElementById('dynamic-description');
  
  if (eyebrowEl) eyebrowEl.textContent = config.eyebrow;
  if (titleEl) titleEl.textContent = config.title;
  if (descEl) descEl.textContent = config.description;
  
  document.title = `${config.title} | Sandip Munde`;

  const pageIntro = document.querySelector('.page-intro');
  if (pageIntro && !document.querySelector('.category-nav')) {
    pageIntro.insertAdjacentHTML('afterend', navHtml);
  }

  try {
    let posts = await loadPostIndex();
    
    if (filterTag) {
      posts = posts.filter(post => 
        post.tags && post.tags.some(tag => 
          tag === `cat-${filterTag}`
        )
      );
    }
    
    if (posts.length === 0) {
      blogList.innerHTML = '<p style="text-align:center; padding:2rem; color: var(--muted);">No posts found in this category yet. Check back soon!</p>';
    } else {
      blogList.innerHTML = posts.map(renderPostListItem).join("");
    }
    
  } catch (error) {
    console.error("Error:", error);
    blogList.innerHTML = '<p style="text-align:center; padding:2rem; color: var(--muted);">Error loading posts. Please try again later.</p>';
  }
}

initBlogPage();
