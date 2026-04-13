/* Category Navigation Buttons */
.category-nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem auto 3rem;
  flex-wrap: wrap;
}

.category-btn {
  padding: 0.6rem 1.5rem;
  border-radius: 40px;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  background: var(--surface);
  border: 1px solid var(--line);
  color: var(--text);
}

.category-btn:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  background: var(--accent-soft);
}

.category-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}
