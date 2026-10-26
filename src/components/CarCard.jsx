import { Link } from "react-router-dom";
import { Cog, Users, Fuel } from "lucide-react";
import { carHeroImage } from "../data/media";

export default function CarCard({ car }) {
  const price = Number(car.price || 0);

  // Firebase car ki uploaded Cloudinary image
  // agar available hai to wahi use hogi
  const imageSrc = car.imageUrl || car.image || carHeroImage(car);

  return (
    <Link
      to={`/cars/${car.category}/${car.slug}`}
      className="group block bg-panel border border-line rounded-xl overflow-hidden hover:border-gold/60 transition-colors focus-ring"
    >
      {/* Image */}
      <div className="aspect-[16/10] overflow-hidden bg-black">
        <img
          src={imageSrc}
          alt={car.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // Agar Firebase/Cloudinary image load na ho
            // to static fallback image use hogi
            if (e.currentTarget.src !== carHeroImage(car)) {
              e.currentTarget.src = carHeroImage(car);
            }
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4">

        {/* Name + Price */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-base text-cream">
              {car.name}
            </h3>

            <p className="text-xs text-mute mt-0.5">
              {capitalize(car.category)} · {car.year}
            </p>
          </div>

          <p className="text-gold font-display text-lg whitespace-nowrap">
            Rs. {price.toLocaleString("en-PK")}
            <span className="text-mute text-xs font-body">
              /day
            </span>
          </p>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-4 mt-3 text-xs text-mute">

          <span className="flex items-center gap-1">
            <Cog size={13} />
            {car.transmission}
          </span>

          <span className="flex items-center gap-1">
            <Users size={13} />
            {car.seats} Seats
          </span>

          <span className="flex items-center gap-1">
            <Fuel size={13} />
            {car.fuel}
          </span>

        </div>

        {/* Availability */}
        <div className="flex items-center justify-between mt-4">

          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              car.available
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-red-500/15 text-red-400"
            }`}
          >
            {car.available ? "Available" : "Booked"}
          </span>

          <span className="text-xs font-semibold text-gold border border-gold/50 rounded-md px-3 py-1.5 group-hover:bg-gold group-hover:text-ink transition-colors">
            View Details
          </span>

        </div>
      </div>
    </Link>
  );
}

function capitalize(s = "") {
  return s.charAt(0).toUpperCase() + s.slice(1);
}