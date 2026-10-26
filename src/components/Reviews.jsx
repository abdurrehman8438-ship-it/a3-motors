import { Star } from "lucide-react";

const reviews = [
  {
    name: "Ahmed Raza",
    city: "Lahore",
    text: "The car was in perfect condition and the booking process was so easy. Highly recommended for anyone visiting the city.",
  },
  {
    name: "Sarah Khan",
    city: "Karachi",
    text: "A3 Motors made my trip unforgettable. Great service, clean cars, and a very professional team from start to finish.",
  },
  {
    name: "Usman Ali",
    city: "Faisalabad",
    text: "Best car rental service in town. Will definitely rent again — fair pricing and the staff were genuinely helpful.",
  },
];

export default function Reviews() {
  return (
    <section className="container-px py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl md:text-3xl text-cream">
            What Our Customers Say
          </h2>
          <p className="text-mute text-sm mt-1">Real people. Real experiences.</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {reviews.map((r) => (
          <div
            key={r.name}
            className="bg-panel border border-line rounded-xl p-6 flex flex-col gap-4"
          >
            <div className="flex gap-1 text-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <p className="text-sm text-cream/85 leading-relaxed">“{r.text}”</p>
            <div className="flex items-center gap-3 mt-auto pt-2">
              <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center font-display text-gold text-sm">
                {r.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-cream">{r.name}</p>
                <p className="text-xs text-mute">{r.city}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
