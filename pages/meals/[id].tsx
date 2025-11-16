import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { getMealById, parseIngredients } from "@/lib/api";
import type { Meal } from "@/types/meal";

/**
 * Meal Detail Page
 *
 * Displays comprehensive information about a single meal including:
 * - Full-size image
 * - Name, category, and area
 * - Complete ingredient list with measurements
 * - Step-by-step cooking instructions
 * - Additional metadata (tags, YouTube link)
 * - Back navigation to home page
 */
export default function MealDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [meal, setMeal] = useState<Meal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch meal data when ID is available
   */
  useEffect(() => {
    async function loadMeal() {
      if (!id || typeof id !== "string") {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const mealData = await getMealById(id);

        if (!mealData) {
          setError("Meal not found");
          setMeal(null);
        } else {
          setMeal(mealData);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load meal details. Please try again."
        );
        setMeal(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadMeal();
  }, [id]);

  /**
   * Loading State
   */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            {/* Back button skeleton */}
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>

            {/* Image skeleton */}
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8"></div>

            {/* Title skeleton */}
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>

            {/* Tags skeleton */}
            <div className="flex gap-2 mb-8">
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>

            {/* Content skeletons */}
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Error State (404 or network error)
   */
  if (error || !meal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BackButton />

          <div className="text-center py-12">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {error === "Meal not found" ? "Meal Not Found" : "Error"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || "This meal could not be found."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Parse ingredients
   */
  const ingredients = parseIngredients(meal);

  /**
   * Parse tags
   */
  const tags = meal.strTags
    ? meal.strTags.split(",").map((tag) => tag.trim())
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <BackButton />

        {/* Meal Image */}
        <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={meal.strMealThumb}
            alt={meal.strMeal}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 896px, 896px"
          />
        </div>

        {/* Meal Title */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {meal.strMeal}
        </h1>

        {/* Meal Metadata */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Badge color="blue">{meal.strCategory}</Badge>
          <Badge color="green">{meal.strArea}</Badge>
          {tags.map((tag) => (
            <Badge key={tag} color="gray">
              {tag}
            </Badge>
          ))}
        </div>

        {/* YouTube Link */}
        {meal.strYoutube && (
          <div className="mb-8 aspect-video">
            <iframe
              className="w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${
                meal.strYoutube.split("v=")[1]
              }`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* Two Column Layout for Ingredients and Instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ingredients Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ingredients
              </h2>
              <ul className="space-y-2">
                {ingredients.map((item, index) => (
                  <li
                    key={index}
                    className="text-gray-700 dark:text-gray-300 flex justify-between"
                  >
                    <span className="font-medium">{item.ingredient}</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {item.measure}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Instructions
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                  {meal.strInstructions}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Back Button Component
 */
function BackButton() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 transition-colors"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      <span className="font-medium">Back to recipes</span>
    </Link>
  );
}

/**
 * Badge Component for tags
 */
interface BadgeProps {
  children: React.ReactNode;
  color: "blue" | "green" | "gray";
}

function Badge({ children, color }: BadgeProps) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClasses[color]}`}
    >
      {children}
    </span>
  );
}
