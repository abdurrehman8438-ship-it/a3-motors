import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";

import db from "../firebase/firestore";
import {
  categories,
  cars as staticCars,
  getCategoryBySlug,
} from "../data/cars";

import CarCard from "../components/CarCard";

const Cars = () => {
  const [firebaseCars, setFirebaseCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceMax, setPriceMax] = useState(50000);
  const [selectedTransmission, setSelectedTransmission] = useState("all");
  const [selectedFuel, setSelectedFuel] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  /* ---------------------------------
     Load Firebase Cars
  --------------------------------- */
  useEffect(() => {
    const carsRef = collection(db, "cars");

    const unsubscribe = onSnapshot(
      carsRef,
      (snapshot) => {
        const carsData = snapshot.docs.map((carDoc) => {
          const data = carDoc.data();

          return {
            id: carDoc.id,

            slug: data.slug || carDoc.id,

            name: data.name || "Unnamed Car",

            category: data.category || "other",

            price: Number(
              data.pricePerDay ?? data.price ?? 0
            ),

            pricePerDay: Number(
              data.pricePerDay ?? data.price ?? 0
            ),

            imageUrl: data.imageUrl || "",

            image: data.image || data.imageUrl || "",

            year: data.year || data.model || "N/A",

            model: data.model || "",

            transmission: data.transmission || "Automatic",

            fuel: data.fuelType || data.fuel || "Petrol",

            fuelType: data.fuelType || data.fuel || "Petrol",

            seats: data.seats || 5,

            description: data.description || "",

            available:
              data.status === "booked" ||
              data.booking?.isBooked === true
                ? false
                : true,

            status: data.status || "available",

            booking: data.booking || null,

            engine: data.engine || "N/A",

            mileage: data.mileage || "N/A",

            features: data.features || [],

            durations: data.durations || [],
          };
        });

        setFirebaseCars(carsData);
        setLoading(false);
        setFirebaseError("");
      },
      (error) => {
        console.error("Firebase cars error:", error);
        setFirebaseError("Firebase cars could not be loaded.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /* ---------------------------------
     Combine Static + Firebase Cars
  --------------------------------- */
  const allCars = useMemo(() => {
    const firebaseSlugs = new Set(
      firebaseCars.map((car) => car.slug)
    );

    const formattedStaticCars = staticCars.map((car) => ({
      ...car,

      price: Number(car.price || 0),

      available:
        car.available !== false,

      imageUrl: car.imageUrl || "",

    }));

    const filteredStaticCars = formattedStaticCars.filter(
      (car) => !firebaseSlugs.has(car.slug)
    );

    return [
      ...filteredStaticCars,
      ...firebaseCars,
    ];
  }, [firebaseCars]);

  /* ---------------------------------
     Maximum Price
  --------------------------------- */
  const maxCarPrice = useMemo(() => {
    const prices = allCars
      .map((car) => Number(car.price || 0))
      .filter((price) => price > 0);

    if (prices.length === 0) {
      return 50000;
    }

    return Math.max(50000, ...prices);
  }, [allCars]);

  /* ---------------------------------
     Category
  --------------------------------- */
  const categoryData =
    selectedCategory === "all"
      ? null
      : getCategoryBySlug(selectedCategory);

  /* ---------------------------------
     Filtering
  --------------------------------- */
  const filteredCars = useMemo(() => {
    let result = [...allCars];

    // Category
    if (selectedCategory !== "all") {
      result = result.filter(
        (car) => car.category === selectedCategory
      );
    }

    // Price
    result = result.filter(
      (car) =>
        Number(car.price || 0) <= priceMax
    );

    // Transmission
    if (selectedTransmission !== "all") {
      result = result.filter(
        (car) =>
          String(car.transmission || "").toLowerCase() ===
          selectedTransmission.toLowerCase()
      );
    }

    // Fuel
    if (selectedFuel !== "all") {
      result = result.filter(
        (car) =>
          String(car.fuel || "").toLowerCase() ===
          selectedFuel.toLowerCase()
      );
    }

    // Sorting
    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );
    }

    if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) =>
        String(a.name || "").localeCompare(
          String(b.name || "")
        )
      );
    }

    return result;
  }, [
    allCars,
    selectedCategory,
    priceMax,
    selectedTransmission,
    selectedFuel,
    sortBy,
  ]);

  /* ---------------------------------
     Reset Filters
  --------------------------------- */
  const resetFilters = () => {
    setSelectedCategory("all");
    setPriceMax(maxCarPrice);
    setSelectedTransmission("all");
    setSelectedFuel("all");
    setSortBy("default");
  };

  return (
    <div className="min-h-screen bg-ink text-cream">

      {/* Header */}
      <section className="border-b border-line">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">

          <p className="text-gold uppercase tracking-widest text-sm">
            A3 Motors
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-3">
            Our Cars
          </h1>

          <p className="text-gray-400 mt-3 max-w-2xl">
            Explore our premium collection of vehicles
            available for rental.
          </p>

        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-10">

        {/* Filters */}
        <div className="border border-line rounded-2xl p-5 mb-10 bg-black/20">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">

            {/* Category */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Category
              </label>

              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value)
                }
                className="w-full bg-ink border border-line rounded-lg px-4 py-3 text-cream outline-none focus:border-gold"
              >
                <option value="all">
                  All Cars
                </option>

                {categories.map((category) => (
                  <option
                    key={category.slug}
                    value={category.slug}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Maximum Price
              </label>

              <select
                value={priceMax}
                onChange={(e) =>
                  setPriceMax(Number(e.target.value))
                }
                className="w-full bg-ink border border-line rounded-lg px-4 py-3 text-cream outline-none focus:border-gold"
              >
                <option value={10000}>
                  Rs. 10,000
                </option>

                <option value={15000}>
                  Rs. 15,000
                </option>

                <option value={20000}>
                  Rs. 20,000
                </option>

                <option value={25000}>
                  Rs. 25,000
                </option>

                <option value={30000}>
                  Rs. 30,000
                </option>

                <option value={35000}>
                  Rs. 35,000
                </option>

                <option value={40000}>
                  Rs. 40,000
                </option>

                <option value={45000}>
                  Rs. 45,000
                </option>

                <option value={50000}>
                  Rs. 50,000+
                </option>
              </select>
            </div>

            {/* Transmission */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Transmission
              </label>

              <select
                value={selectedTransmission}
                onChange={(e) =>
                  setSelectedTransmission(e.target.value)
                }
                className="w-full bg-ink border border-line rounded-lg px-4 py-3 text-cream outline-none focus:border-gold"
              >
                <option value="all">
                  All
                </option>

                <option value="automatic">
                  Automatic
                </option>

                <option value="manual">
                  Manual
                </option>
              </select>
            </div>

            {/* Fuel */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Fuel
              </label>

              <select
                value={selectedFuel}
                onChange={(e) =>
                  setSelectedFuel(e.target.value)
                }
                className="w-full bg-ink border border-line rounded-lg px-4 py-3 text-cream outline-none focus:border-gold"
              >
                <option value="all">
                  All
                </option>

                <option value="petrol">
                  Petrol
                </option>

                <option value="diesel">
                  Diesel
                </option>

                <option value="hybrid">
                  Hybrid
                </option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Sort By
              </label>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="w-full bg-ink border border-line rounded-lg px-4 py-3 text-cream outline-none focus:border-gold"
              >
                <option value="default">
                  Default
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="name">
                  Name
                </option>
              </select>
            </div>

          </div>

          {/* Reset */}
          <div className="mt-5 flex justify-end">
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 border border-gold text-gold rounded-lg hover:bg-gold hover:text-black transition"
            >
              Reset Filters
            </button>
          </div>

        </div>

        {/* Firebase Error */}
        {firebaseError && (
          <div className="mb-6 border border-red-500 bg-red-500/10 text-red-400 rounded-lg px-4 py-3">
            {firebaseError}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <p className="text-gold">
              Loading cars...
            </p>
          </div>
        )}

        {/* Category Heading */}
        {!loading && categoryData && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              {categoryData.name}
            </h2>

            {categoryData.description && (
              <p className="text-gray-400 mt-2">
                {categoryData.description}
              </p>
            )}
          </div>
        )}

        {/* Results */}
        {!loading && (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-gray-400">
                Showing{" "}
                <span className="text-cream font-semibold">
                  {filteredCars.length}
                </span>{" "}
                cars
              </p>
            </div>

            {filteredCars.length === 0 ? (
              <div className="border border-line rounded-2xl p-12 text-center">
                <h2 className="text-2xl font-semibold">
                  No Cars Found
                </h2>

                <p className="text-gray-400 mt-2">
                  Try changing your filters.
                </p>

                <button
                  onClick={resetFilters}
                  className="mt-5 px-5 py-3 bg-gold text-black rounded-lg font-semibold"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {filteredCars.map((car) => (
                  <CarCard
                    key={car.id || car.slug}
                    car={car}
                  />
                ))}

              </div>
            )}
          </>
        )}

      </section>
    </div>
  );
};

export default Cars;