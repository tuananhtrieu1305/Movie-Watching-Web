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
          title="Recommended for You"
          viewAllLink="/movies?sort=rating"
        />

        <CategorySection
          title="Recently Updated"
          viewAllLink="/movies?sort=newest"
        />

        <CategorySection
          title="Hot TV Series"
          viewAllLink="/movies?type=series"
        />

        <CategorySection
          title="Action Movies"
          viewAllLink="/movies?genre=Action&type=movie"
        />

        <CategorySection
          title="Animation Movies"
          viewAllLink="/movies?genre=Animation&type=movie"
        />
      </div>
    </div>
  );
};

export default HomePage;

