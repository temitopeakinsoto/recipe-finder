import Link from "next/link";
import Image from "next/image";

/**
 * Props for the MealCard component
 */
interface MealCardProps {
  /** Unique meal identifier for routing to detail page */
  id: string;
  /** Display name of the meal */
  name: string;
  /** URL of the meal's thumbnail image */
  thumbnail: string;
  /** Optional category name (e.g., "Beef", "Dessert") */
  category?: string;
  /** Optional area/cuisine name (e.g., "Italian", "Chinese") */
  area?: string;
}

/**
 * MealCard Component
 *
 * Displays a clickable card with meal information including thumbnail, name, and tags.
 * Links to the meal detail page at `/meals/[id]`.
 *
 * Features:
 * - Responsive image with lazy loading and optimized sizing
 * - Color-coded tags (blue for category, green for area)
 * - Hover effect with elevated shadow
 * - Truncated meal name (single line with ellipsis)
 *
 * @example
 * ```tsx
 * <MealCard
 *   id="52772"
 *   name="Teriyaki Chicken Casserole"
 *   thumbnail="https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg"
 *   category="Chicken"
 *   area="Japanese"
 * />
 * ```
 */
export default function MealCard({
  id,
  name,
  thumbnail,
  category,
  area,
}: MealCardProps) {
  return (
    <Card href={`/meals/${id}`}>
      <CardImage src={thumbnail} alt={name} />
      <CardContent>
        <CardTitle>{name}</CardTitle>
        <CardTags>
          {category && <Tag variant="blue">{category}</Tag>}
          {area && <Tag variant="green">{area}</Tag>}
        </CardTags>
      </CardContent>
    </Card>
  );
}

// Card sub-components

interface CardProps {
  href: string;
  children: React.ReactNode;
}

function Card({ href, children }: CardProps) {
  return (
    <Link
      href={href}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 block"
    >
      {children}
    </Link>
  );
}

interface CardImageProps {
  src: string;
  alt: string;
}

function CardImage({ src, alt }: CardImageProps) {
  return (
    <div className="relative h-48 w-full bg-gray-200">
      <Image
        src={src}
        alt={alt}
        fill
        loading="lazy"
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
      />
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
}

function CardContent({ children }: CardContentProps) {
  return <div className="p-4">{children}</div>;
}

interface CardTitleProps {
  children: React.ReactNode;
}

function CardTitle({ children }: CardTitleProps) {
  return (
    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
      {children}
    </h3>
  );
}

interface CardTagsProps {
  children: React.ReactNode;
}

function CardTags({ children }: CardTagsProps) {
  return (
    <div className="flex flex-wrap gap-2 text-sm text-gray-600">{children}</div>
  );
}

interface TagProps {
  variant: "blue" | "green";
  children: React.ReactNode;
}

function Tag({ variant, children }: TagProps) {
  const variants = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
  };

  return (
    <span className={`${variants[variant]} px-2 py-1 rounded`}>{children}</span>
  );
}
