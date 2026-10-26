import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Wallet, Headset, CalendarCheck2, ArrowRight } from "lucide-react";
import CategoryCard from "../components/CategoryCard";
import CarCard from "../components/CarCard";
import Reviews from "../components/Reviews";
import { genericImage, HERO_VIDEO_URL } from "../data/media";
import { categories, cars } from "../data/cars";

const featured = ["toyota-corolla", "toyota-fortuner", "bmw-5-series", "ford-mustang"].map(
  (slug) => cars.find((c) => c.slug === slug)
);

const perks = [
  { icon: ShieldCheck, title: "Premium Fleet", text: "Latest & well-maintained cars" },
  { icon: Wallet, title: "Affordable Rates", text: "Best prices in the market" },
  { icon: Headset, title: "24/7 Support", text: "Always here for you" },
  { icon: CalendarCheck2, title: "Easy Booking", text: "Quick & hassle-free" },
];

export default function Home() {
  const navigate = useNavigate();
  const [cat, setCat] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(cat ? `/cars/${cat}` : "/cars");
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={genericImage("A3 Motors Showroom")}
            className="w-full h-full object-cover opacity-60"
          >
            <source src={HERO_VIDEO_URL} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/40 to-transparent" />
        </div>

        <div className="relative container-px pt-16 pb-24 md:pt-24 md:pb-32">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-gold text-xs md:text-sm tracking-wide font-medium mb-4"
          >
            Premium Cars · Flexible Rentals · Trusted Service
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-cream max-w-2xl"
          >
            Drive Your <span className="text-gold">Dreams Today</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-cream/75 mt-5 max-w-md text-sm md:text-base"
          >
            Premium cars for every journey. Rent, drive, and experience the best
            with A3 Motors.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-3 mt-8"
          >
            <Link
              to="/cars"
              className="bg-gold text-ink font-semibold text-sm px-6 py-3 rounded-md hover:bg-gold-dim transition-colors focus-ring"
            >
              Explore Cars
            </Link>
            <Link
              to="/contact"
              className="border border-cream/30 text-cream text-sm px-6 py-3 rounded-md hover:border-gold hover:text-gold transition-colors focus-ring"
            >
              Rent a Car
            </Link>
          </motion.div>
        </div>

        {/* Category strip */}
        <div className="relative container-px pb-10">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {categories.map((c) => (
              <Link
                key={c.slug}
                to={`/cars/${c.slug}`}
                className="bg-panel/80 backdrop-blur border border-line rounded-lg p-3 text-center hover:border-gold/60 transition-colors focus-ring"
              >
                <p className="text-xs sm:text-sm font-medium text-cream">{c.name}</p>
                <p className="text-[10px] text-mute mt-0.5 hidden sm:block">{c.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Availability check */}
      <section className="container-px -mt-6 md:-mt-10 relative z-10">
        <form
          onSubmit={handleSearch}
          className="bg-panel border border-line rounded-xl p-5 md:p-6 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
        >
          <div className="md:col-span-3 mb-1">
            <h2 className="font-display text-lg text-cream">Check Car Availability</h2>
          </div>
          <div>
            <label className="text-xs text-mute block mb-1.5">Category</label>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="w-full bg-panel-2 border border-line rounded-md px-3 py-2.5 text-sm text-cream focus-ring"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-mute block mb-1.5">Price Range</label>
            <select className="w-full bg-panel-2 border border-line rounded-md px-3 py-2.5 text-sm text-cream focus-ring">
              <option>Any Price</option>
              <option>$30 - $70</option>
              <option>$70 - $120</option>
              <option>$120+</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-gold text-ink font-semibold text-sm px-6 py-2.5 rounded-md hover:bg-gold-dim transition-colors focus-ring"
          >
            Search Cars
          </button>
        </form>
      </section>

      {/* Categories grid */}
      <section className="container-px py-16">
        <h2 className="font-display text-2xl md:text-3xl text-cream mb-8">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c) => (
            <CategoryCard key={c.slug} category={c} />
          ))}
        </div>
      </section>

      {/* Featured cars */}
      <section className="container-px py-4 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl text-cream">Featured Cars</h2>
            <p className="text-mute text-sm mt-1">Our most popular rentals</p>
          </div>
          <Link
            to="/cars"
            className="hidden sm:flex items-center gap-1 text-gold text-sm font-medium hover:gap-2 transition-all"
          >
            View All Cars <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((c) => (
            <CarCard key={c.slug} car={c} />
          ))}
        </div>
      </section>

      <Reviews />

      {/* Why choose us */}
      <section className="container-px py-16">
        <h2 className="font-display text-2xl md:text-3xl text-cream mb-2">More Than Just a Rental</h2>
        <p className="text-mute text-sm mb-8">Why customers choose A3 Motors</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {perks.map((p) => (
            <div
              key={p.title}
              className="bg-panel border border-line rounded-xl p-5 text-center flex flex-col items-center gap-3"
            >
              <div className="w-11 h-11 rounded-full bg-gold/15 flex items-center justify-center">
                <p.icon size={20} className="text-gold" />
              </div>
              <p className="font-display text-sm text-cream">{p.title}</p>
              <p className="text-xs text-mute">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-px pb-20">
        <div className="relative rounded-xl overflow-hidden border border-line">
          <div className="absolute inset-0">
            <img
              src={genericImage("Ford Mustang")}
              alt=""
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/20" />
          </div>
          <div className="relative p-8 md:p-12 max-w-lg">
            <h3 className="font-display text-2xl md:text-3xl text-cream">Ready to Hit the Road?</h3>
            <p className="text-cream/75 text-sm mt-3">
              Book your dream car today and experience the difference.
            </p>
            <Link
              to="/cars"
              className="inline-block mt-6 bg-gold text-ink font-semibold text-sm px-6 py-3 rounded-md hover:bg-gold-dim transition-colors focus-ring"
            >
              Explore Cars
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
