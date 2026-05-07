import { Link } from "react-router-dom";

const FALLBACK_CATEGORIES = [
  { name: "Phim Hành Động", icon: "💥", color: "#e23636", link: "/movies?genre=hanh-dong" },
  { name: "Hài hước", icon: "😂", color: "#22c55e", link: "/movies?genre=hai-huoc" },
  { name: "Netflix", icon: "N", color: "#e50914", link: "/series" },
  { name: "Hoạt Hình", icon: "🎌", color: "#3b82f6", link: "/movies?genre=hoat-hinh" },
  {
    name: "Tình Cảm",
    icon: "❤️",
    color: "#8b5cf6",
    link: "/movies?genre=tinh-cam",
  },
  {
    name: "Hình Sự",
    icon: "🕵️",
    color: "#f59e0b",
    link: "/movies?genre=hinh-su",
  },
  { name: "Kinh Dị", icon: "👻", color: "#6366f1", link: "/movies?genre=kinh-di" },
  { name: "Khoa Học", icon: "🌌", color: "#64748b", link: "/movies?genre=khoa-hoc-vien-tuong" },
];

const TAB_COLORS = [
  "#e23636",
  "#22c55e",
  "#e50914",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#6366f1",
  "#0ea5e9",
];

const CategoryTabs = ({ categories = [] }) => {
  const hasDynamicCategories =
    Array.isArray(categories) && categories.length > 0;

  console.log(categories);

  const displayCategories = hasDynamicCategories
    ? categories.slice(0, 8).map((category, index) => ({
        name: category.name,
        icon: "#",
        color: TAB_COLORS[index % TAB_COLORS.length],
        link: category.link,
      }))
    : FALLBACK_CATEGORIES;

  return (
    <div className="category-tabs">
      <h2 className="category-tabs-title">What are you interested in?</h2>
      <div className="category-tabs-list">
        {displayCategories.map((category, index) => (
          <Link
            key={index}
            to={category.link}
            className="category-tab"
            style={{ "--tab-color": category.color }}
          >
            <span className="category-tab-icon">{category.icon}</span>
            <span className="category-tab-name">{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
