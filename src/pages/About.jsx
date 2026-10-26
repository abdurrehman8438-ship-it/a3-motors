import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Play, ShieldCheck, HeartHandshake, CalendarClock, Users2, MapPin, Clock } from "lucide-react";
import { genericImage, carGalleryImages, STORY_VIDEO_URL } from "../data/media";
import StatCounter from "../components/StatCounter";
import { categories, getCarsByCategory } from "../data/cars";

const values = [
  { icon: ShieldCheck, title: "Premium Fleet", text: "Latest models, always inspected" },
  { icon: HeartHandshake, title: "Trusted Service", text: "100% customer satisfaction" },
  { icon: CalendarClock, title: "Flexible Rentals", text: "Daily, weekly, monthly" },
  { icon: Users2, title: "Professional Team", text: "Always here for you" },
];

export default function About() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={genericImage("A3 Motors Showroom")}
            alt=""
            className="w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/40" />
        </div>
        <div className="relative container-px py-16">
          <p className="text-gold text-xs tracking-wide font-medium mb-3">About A3 Motors</p>
          <h1 className="font-display text-3xl md:text-4xl text-cream max-w-xl">
            Your Trusted Partner for Premium Car Rentals
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="container-px py-14 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="font-display text-2xl text-cream mb-4">Our Story</h2>
          <p className="text-cream/75 text-sm leading-relaxed">
            A3 Motors was founded with a simple vision: to make premium cars
            accessible to everyone. What started as a small showroom in
            Faisalabad has grown into a trusted name in car rentals and sales,
            serving customers across the city and beyond. Every car in our
            fleet is chosen and maintained with one goal in mind — giving you
            a drive worth remembering.
          </p>
          <Link
            to="/cars"
            className="inline-block mt-6 bg-gold text-ink font-semibold text-sm px-6 py-3 rounded-md hover:bg-gold-dim transition-colors focus-ring"
          >
            Explore Our Fleet
          </Link>
        </div>
        <StoryVideo />
      </section>

      {/* Mission & vision */}
      <section className="container-px pb-14 grid sm:grid-cols-2 gap-5">
        <div className="bg-panel border border-line rounded-xl p-6">
          <h3 className="font-display text-lg text-cream mb-2">Our Mission</h3>
          <p className="text-sm text-cream/75 leading-relaxed">
            To provide affordable, reliable and premium car rental services
            with exceptional customer support at every step of the journey.
          </p>
        </div>
        <div className="bg-panel border border-line rounded-xl p-6">
          <h3 className="font-display text-lg text-cream mb-2">Our Vision</h3>
          <p className="text-sm text-cream/75 leading-relaxed">
            To become the most trusted and preferred car rental brand in
            Pakistan, known for quality, service and innovation.
          </p>
        </div>
      </section>

      {/* Why choose */}
      <section className="container-px pb-14">
        <h2 className="font-display text-2xl text-cream mb-8 text-center">Why Choose A3 Motors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {values.map((v) => (
            <div key={v.title} className="text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center">
                <v.icon size={20} className="text-gold" />
              </div>
              <p className="font-display text-sm text-cream">{v.title}</p>
              <p className="text-xs text-mute">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="container-px pb-14">
        <div className="bg-panel border border-line rounded-xl p-8 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCounter value={500} suffix="+" label="Cars Available" />
          <StatCounter value={2500} suffix="+" label="Happy Customers" />
          <StatCounter value={5} suffix="+" label="Years of Experience" />
          <StatCounter value={categories.length} label="Categories" />
        </div>
      </section>

      {/* Categories overview */}
      <section className="container-px pb-14">
        <h2 className="font-display text-2xl text-cream mb-8">Cars Organized by Category</h2>
        <div className="space-y-8">
          {categories.map((cat) => {
            const list = getCarsByCategory(cat.slug).slice(0, 3);
            if (list.length === 0) return null;
            return (
              <div key={cat.slug}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg text-cream">{cat.name}</h3>
                  <Link to={`/cars/${cat.slug}`} className="text-gold text-xs font-medium hover:underline">
                    View all
                  </Link>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {list.map((c) => (
                    <Link
                      key={c.slug}
                      to={`/cars/${c.category}/${c.slug}`}
                      className="bg-panel border border-line rounded-lg overflow-hidden hover:border-gold/60 transition-colors focus-ring"
                    >
                      <div className="aspect-[16/10] overflow-hidden">
                        <img
                          src={carGalleryImages(c, 1)[0]}
                          alt={c.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <p className="text-sm text-cream">{c.name}</p>
                        <p className="text-gold text-sm font-display">${c.price}/day</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Showroom */}
      <section className="container-px pb-16">
        <div className="relative rounded-xl overflow-hidden border border-line aspect-[21/9]">
          <img
            src={genericImage("A3 Motors Showroom Interior")}
            alt="A3 Motors showroom"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent" />
          <div className="absolute left-0 top-0 bottom-0 p-6 md:p-10 flex flex-col justify-center max-w-sm">
            <h3 className="font-display text-xl md:text-2xl text-cream">Visit Our Showroom</h3>
            <p className="text-cream/75 text-sm mt-2 flex items-center gap-2">
              <MapPin size={15} className="text-gold shrink-0" /> Faisalabad, Pakistan
            </p>
            <p className="text-cream/75 text-sm mt-1 flex items-center gap-2">
              <Clock size={15} className="text-gold shrink-0" /> Mon–Sun · 9:00 AM – 10:00 PM
            </p>
            <Link
              to="/contact"
              className="inline-block w-fit mt-5 bg-gold text-ink font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-gold-dim transition-colors focus-ring"
            >
              View Location
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StoryVideo() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) {
      v.pause();
    } else {
      v.play();
    }
    setPlaying((p) => !p);
  };

  return (
    <div className="relative aspect-video rounded-xl overflow-hidden border border-line group">
      <video
        ref={videoRef}
        poster={genericImage("A3 Motors — Our Story")}
        className="w-full h-full object-cover"
        playsInline
        onClick={toggle}
        onEnded={() => setPlaying(false)}
      >
        <source src={STORY_VIDEO_URL} type="video/mp4" />
      </video>
      {!playing && (
        <button
          onClick={toggle}
          aria-label="Play video"
          className="absolute inset-0 bg-ink/30 flex items-center justify-center cursor-pointer focus-ring"
        >
          <span className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Play size={22} className="text-ink ml-0.5" fill="currentColor" />
          </span>
        </button>
      )}
    </div>
  );
}
