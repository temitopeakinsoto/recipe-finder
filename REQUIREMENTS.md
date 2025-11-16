# Recipe Finder - Requirements

## API Documentation

[TheMealDB API Documentation](https://www.themealdb.com/api.php)

## Assessment Focus

**Quality over quantity.** We value well-crafted, maintainable code over completing every requirement. Focus on clean architecture, solid testing, and proper error handling. UI polish isn’t the priority, but functionality and code quality are. It’s better to deliver fewer features done well than to rush through everything.

## Base Components Provided

To help you focus on functionality rather than styling, **some** base UI components are already provided in the `components/` directory:

- **SearchBar.tsx** - Search input component
- **ActiveFilters.tsx** - Display of currently active filters
- **MealCard.tsx** - Card component for displaying meals
- **Pagination.tsx** - Pagination controls
- **EmptyState.tsx** - Empty state component
- **FilterPanel.tsx** - Filter controls for categories and areas **(TO BE IMPLEMENTED)**

These components come with test files and basic styling. You can use them as-is or customise them as needed for your implementation.

## Live Example

A reference implementation is available to demonstrate the expected functionality and user experience:

- **URL:** <https://recipe-finder-technical-assessment.netlify.app/>
- **Password:** `maps-test-2025!`

Review this example to understand:

- Expected design and layout
- Search and filtering behaviour
- Overall application flow and user interactions

Use this as a guide for your implementation, while applying your own technical approach and code organisation.

## Technical Requirements

| ID | Requirement |
|----|-------------|
| **1. Search Functionality** | |
| 1.1 | Implement a search interface that allows users to search meals by name |
| 1.2 | Display search results |
| 1.3 | Handle empty search states appropriately |
| 1.4 | You may choose client-side or server-side rendering approach |
| **2. Filtering System** | |
| 2.1 | Implement filters for the following categories:<br>• Category (e.g., Beef, Chicken, Dessert, Vegetarian)<br>• Area/Cuisine (e.g., Italian, Mexican, Chinese, American) |
| 2.2 | Filters can work independently or in combination |
| 2.3 | Update results when filters change |
| **3. Meal List View** | |
| 3.1 | Display meals in a responsive grid layout |
| 3.2 | Each meal card must show:<br>• Meal thumbnail image<br>• Meal name<br>• Clickable to navigate to detail page |
| 3.4 | Handle empty results gracefully |
| **4. Recipe Detail Page** | |
| 4.1 | Create a dedicated page at route `/meals/[id]` |
| 4.2 | Display full-size meal image |
| 4.3 | Display meal name, category, and area |
| 4.4 | Display complete ingredient list with measurements |
| 4.5 | Display step-by-step cooking instructions |
| 4.6 | Display additional metadata (tags, YouTube video link if available) |
| 4.7 | Provide back navigation to main page |
| **5. API Caching** | |
| 5.1 | Implement caching for API requests to improve performance and reduce unnecessary API calls |
| 5.2 | Consider and implement any caching strategy |
| **6. Error Handling** | |
| 6.1 | Implement network error handling with user-friendly messages |
| 6.2 | Handle invalid meal ID on detail page |
| **7. Testing** | |
| 7.1 | Write tests for:<br>• Components<br>• API service functions<br>• Caching implementation |

### General Must Haves

- TypeScript with proper type definitions
- Clean code organisation and file structure
- Error handling
- Test coverage (Jest + React Testing Library)

### Bonus Points

- Server-side rendering using Next.js getServerSideProps
- Accessibility considerations (ARIA labels, keyboard navigation, semantic HTML)
- Code comments explaining complex logic
- Clean, intuitive UI/UX
