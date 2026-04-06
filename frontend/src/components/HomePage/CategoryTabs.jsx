import { Link } from "react-router-dom";

const CategoryTabs = () => {
  const categories = [
    { name: "Marvel", icon: "🦸", color: "#e23636", link: "/movies?genre=Sci-Fi,Action" },
    { name: "Sitcom", icon: "😂", color: "#22c55e", link: "/series" },
    { name: "Netflix", icon: "N", color: "#e50914", link: "/movies?trending=true" },
    { name: "Anime", icon: "🎌", color: "#3b82f6", link: "/movies?type=anime" },
    { name: "Korean", icon: "🇰🇷", color: "#8b5cf6", link: "/movies?country=KR" },
    { name: "Action", icon: "💥", color: "#f59e0b", link: "/movies?genre=Action" },
    { name: "Horror", icon: "👻", color: "#6366f1", link: "/movies?genre=Horror" },
    { name: "+3 Topics", icon: "➕", color: "#64748b", link: "/movies" },
  ];

  return (
    <div className="category-tabs">
      <h2 className="category-tabs-title">What are you interested in?</h2>
      <div className="category-tabs-list">
        {categories.map((category, index) => (
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
