import { Link } from "react-router-dom";
import { categoryImage } from "../data/media";
import { getCarsByCategory } from "../data/cars";

export default function CategoryCard({ category }) {
  const count = getCarsByCategory(category.slug).length;
  return (
    <Link
      to={`/cars/${category.slug}`}
      className="group relative rounded-xl overflow-hidden border border-line bg-panel hover:border-gold/60 transition-colors focus-ring"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={categoryImage(category)}
          alt={category.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-display text-lg text-cream">{category.name}</h3>
        <p className="text-xs text-mute">{category.tagline} · {count} cars</p>
      </div>
    </Link>
  );
}
