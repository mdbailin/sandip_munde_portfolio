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
      eyebrow: 'Classroom Insights',
      title: 'Math in Classroom',
      description: 'Strategies and reflections on mathematics learning in IB, CIE, and international classrooms.'
    },
    'research': {
      eyebrow: 'Exploring Mathematics',
      title: 'Math for All Seasons',
      description: 'Mathematical ideas, models, history, and classroom connections for curious learners.'
    },
    'communication': {
      eyebrow: 'Opinion & Commentary',
      title: 'Opinion',
      description: 'Reflections on curriculum, student growth, international education, and leadership.'
    }
  };

  const categories = [
    { tag: 'education', label: 'Math in Classroom' },
    { tag: 'research', label: 'Math for All Seasons' },
    { tag: 'communication', label: 'Opinion' }
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
    title: 'Writing and notes',
    description: 'Essays, curriculum reflections, and short-form mathematics writing.'
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
