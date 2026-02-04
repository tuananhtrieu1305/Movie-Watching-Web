import { Link } from "react-router-dom";

const CategoryTabs = () => {
  const categories = [
    { name: "Marvel", icon: "🦸", color: "#e23636", link: "/category/marvel" },
    { name: "Sitcom", icon: "😂", color: "#22c55e", link: "/category/sitcom" },
    { name: "Netflix", icon: "N", color: "#e50914", link: "/category/netflix" },
    { name: "Anime", icon: "🎌", color: "#3b82f6", link: "/category/anime" },
    { name: "Hàn Quốc", icon: "🇰🇷", color: "#8b5cf6", link: "/category/han-quoc" },
    { name: "Hành Động", icon: "💥", color: "#f59e0b", link: "/category/hanh-dong" },
    { name: "Kinh Dị", icon: "👻", color: "#6366f1", link: "/category/kinh-di" },
    { name: "+3 chủ đề", icon: "➕", color: "#64748b", link: "/categories" },
  ];

  return (
    <div className="category-tabs">
      <h2 className="category-tabs-title">Bạn đang quan tâm gì?</h2>
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
