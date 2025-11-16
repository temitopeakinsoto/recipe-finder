import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import ActiveFilters from "@/components/ActiveFilters";
import MealCard from "@/components/MealCard";
import Pagination from "@/components/Pagination";

// Mock data for demonstration
const mockCategories = [
  {
    idCategory: "1",
    strCategory: "Beef",
    strCategoryThumb: "",
    strCategoryDescription: "",
  },
  {
    idCategory: "2",
    strCategory: "Chicken",
    strCategoryThumb: "",
    strCategoryDescription: "",
  },
  {
    idCategory: "3",
    strCategory: "Dessert",
    strCategoryThumb: "",
    strCategoryDescription: "",
  },
  {
    idCategory: "4",
    strCategory: "Vegetarian",
    strCategoryThumb: "",
    strCategoryDescription: "",
  },
];

const mockAreas = [
  { strArea: "Italian" },
  { strArea: "Mexican" },
  { strArea: "Chinese" },
  { strArea: "American" },
];

const mockMeals = [
  {
    idMeal: "52772",
    strMeal: "Teriyaki Chicken Casserole",
    strMealThumb:
      "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
    strCategory: "Chicken",
    strArea: "Japanese",
  },
  {
    idMeal: "52944",
    strMeal: "Escovitch Fish",
    strMealThumb: "https://www.themealdb.com/images/media/meals/1520084413.jpg",
    strCategory: "Seafood",
    strArea: "Jamaican",
  },
  {
    idMeal: "52929",
    strMeal: "Timbits",
    strMealThumb:
      "https://www.themealdb.com/images/media/meals/txsupu1511815755.jpg",
    strCategory: "Dessert",
    strArea: "Canadian",
  },
  {
    idMeal: "52768",
    strMeal: "Apple Frangipan Tart",
    strMealThumb:
      "https://www.themealdb.com/images/media/meals/wxywrq1468235067.jpg",
    strCategory: "Dessert",
    strArea: "British",
  },
  {
    idMeal: "52893",
    strMeal: "Apple & Blackberry Crumble",
    strMealThumb:
      "https://www.themealdb.com/images/media/meals/xvsurr1511719182.jpg",
    strCategory: "Dessert",
    strArea: "British",
  },
  {
    idMeal: "52767",
    strMeal: "Bakewell tart",
    strMealThumb:
      "https://www.themealdb.com/images/media/meals/wyrqqq1468233628.jpg",
    strCategory: "Dessert",
    strArea: "British",
  },
  {
    idMeal: "52792",
    strMeal: "Bread and Butter Pudding",
    strMealThumb:
      "https://www.themealdb.com/images/media/meals/xqwwpy1483908697.jpg",
    strCategory: "Dessert",
    strArea: "British",
  },
  {
    idMeal: "52803",
    strMeal: "Beef Wellington",
    strMealThumb:
      "https://www.themealdb.com/images/media/meals/vvpprx1487325699.jpg",
    strCategory: "Beef",
    strArea: "British",
  },
];

/**
 * Home Page Component
 *
 * This is a mock layout demonstrating how to integrate all the provided components.
 * Candidates should:
 * 1. Replace mock data with real API calls to TheMealDB
 * 2. Implement actual state management (useState/useReducer)
 * 3. Connect handlers to update state and trigger API calls
 * 4. Implement caching strategy for API responses
 * 5. Add error handling and loading states
 * 6. Complete the FilterPanel component implementation
 */
export default function Home() {
  // Mock handlers
  const handleSearch = (query: string) => {
    console.log("Search:", query);
  };

  const handleRemoveCategory = (category: string) => {
    console.log("Remove category:", category);
  };

  const handleRemoveArea = (area: string) => {
    console.log("Remove area:", area);
  };

  const handleCategoryToggle = (category: string) => {
    console.log("Toggle category:", category);
  };

  const handleAreaToggle = (area: string) => {
    console.log("Toggle area:", area);
  };

  const handlePageChange = (page: number) => {
    console.log("Change to page:", page);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Recipe Finder
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Search and discover delicious meals from around the world
          </p>
        </header>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            placeholder="Search for meals..."
            onSearch={handleSearch}
          />
        </div>

        {/* Layout: Filters on left, content on right */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <FilterPanel
              categories={mockCategories}
              areas={mockAreas}
              selectedCategories={["Dessert"]}
              selectedAreas={["British"]}
              onCategoryToggle={handleCategoryToggle}
              onAreaToggle={handleAreaToggle}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Active Filters */}
            <ActiveFilters
              selectedCategories={["Dessert"]}
              selectedAreas={["British"]}
              onRemoveCategory={handleRemoveCategory}
              onRemoveArea={handleRemoveArea}
            />

            {/* Meal Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockMeals.map((meal) => (
                <MealCard
                  key={meal.idMeal}
                  id={meal.idMeal}
                  name={meal.strMeal}
                  thumbnail={meal.strMealThumb}
                  category={meal.strCategory}
                  area={meal.strArea}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={1}
              totalPages={5}
              onPageChange={handlePageChange}
            />

            {/* <EmptyState
              title="No meals found"
              message="Try adjusting your search or filters"
            /> */}
          </main>
        </div>
      </div>
    </div>
  );
}
