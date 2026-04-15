import { categories, type Category } from '../data/lessons'
import './CategoryTabs.css'

interface Props {
  activeCategory: Category
  onSelectCategory: (cat: Category) => void
}

export function CategoryTabs({ activeCategory, onSelectCategory }: Props) {
  return (
    <div className="cat-tabs">
      <div className="cat-tabs__inner">
        <span className="cat-tabs__label">Themes</span>

        {categories.map((cat) => (
          <button
            key={cat}
            className={`cat-tab ${cat === activeCategory ? 'cat-tab--active' : ''}`}
            onClick={() => onSelectCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}
