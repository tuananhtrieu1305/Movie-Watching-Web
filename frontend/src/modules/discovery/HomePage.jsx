import HeroSlider from "../../components/HomePage/HeroSlider";
import CategoryTabs from "../../components/HomePage/CategoryTabs";
import CategorySection from "../../components/HomePage/CategorySection";
import TrendingSection from "../../components/HomePage/TrendingSection";

const HomePage = () => {
  return (
    <div className="homepage">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Main Content */}
      <div className="homepage-content">
        {/* Category Tabs */}
        <CategoryTabs />

        {/* Trending Section */}
        <TrendingSection />

        {/* Movie Sections */}
        <CategorySection
          title="Phim Đề Xuất Cho Bạn"
          viewAllLink="/recommended"
        />

        <CategorySection
          title="Phim Mới Cập Nhật"
          viewAllLink="/new-releases"
        />

        <CategorySection
          title="Phim Bộ Hot"
          viewAllLink="/trending-series"
        />

        <CategorySection
          title="Phim Hành Động"
          viewAllLink="/category/action"
        />

        <CategorySection
          title="Phim Hoạt Hình"
          viewAllLink="/category/animation"
        />
      </div>
    </div>
  );
};

export default HomePage;

