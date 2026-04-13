import { loadPostIndex, renderPostListItem } from "./blog-data.js";
import { initSite } from "./site.js";

async function initBlogPage() {
  initSite("blog.html");

  const blogList = document.getElementById("blog-list");
  
  const params = new URLSearchParams(window.location.search);
  const filterTag = params.get("tag");

  // Customize header based on tag (matching your index.html cards)
  const headerConfig = {
    'education': {
      eyebrow: 'Classroom Insights',
      title: 'Math in Classroom',
      description: 'Strategies, insights, and best practices for teaching mathematics effectively at all levels.'
    },
    'research': {
      eyebrow: 'Exploring Mathematics',
      title: 'Math for All Seasons',
      description: 'Making complex ideas accessible and engaging. Exploring the beauty of mathematics along with historical notes.'
    },
    'communication': {
      eyebrow: 'Opinion & Commentary',
      title: 'Opinion',
      description: 'In other words, blogging, blogging and blogging!!'
    }
  };

  // Default header if no tag or unknown tag
  const defaultConfig = {
    eyebrow: 'Blog',
    title: 'Writing and notes',
    description: 'Essays, project reflections, and short-form research writing.'
  };

  const config = headerConfig[filterTag] || defaultConfig;

  // Update the page header dynamically
  const eyebrowEl = document.getElementById('dynamic-eyebrow');
  const titleEl = document.getElementById('dynamic-title');
  const descEl = document.getElementById('dynamic-description');
  
  if (eyebrowEl) eyebrowEl.textContent = config.eyebrow;
  if (titleEl) titleEl.textContent = config.title;
  if (descEl) descEl.textContent = config.description;
  
  // Update browser title
  document.title = `${config.title} | Dr. Aidin Jalilzadeh`;

  try {
    let posts = await loadPostIndex();
    
    if (filterTag) {
      posts = posts.filter(post => 
        post.tags && post.tags.some(tag => 
          tag.toLowerCase().trim() === filterTag.toLowerCase().trim()
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
