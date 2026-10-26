import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { useAuth } from "../context/AuthContext";
import db from "../firebase/firestore";

import {
  getCarBySlug,
  getRelatedCars,
} from "../data/cars";

import CarCard from "../components/CarCard";

import {
  Cog,
  Users,
  Fuel,
  Check,
  X,
  Heart,
  CalendarDays,
  ArrowLeft,
} from "lucide-react";

import { carGalleryImages } from "../data/media";

const CarDetails = () => {
  const { category, slug } = useParams();
  const { user, userData } = useAuth();

  const [car, setCar] = useState(null);
  const [loadingCar, setLoadingCar] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loadingBooking, setLoadingBooking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadCar = async () => {
      try {
        setLoadingCar(true);
        setError("");
        setMessage("");
        setActiveImage(0);

        const carsRef = collection(db, "cars");
        const q = query(carsRef, where("slug", "==", slug));
        const snapshot = await getDocs(q);

        if (cancelled) return;

        if (!snapshot.empty) {
          const carDoc = snapshot.docs[0];
          const data = carDoc.data();

          setCar({
            id: carDoc.id,
            ...data,
            slug: data.slug || slug,
            name: data.name || "Unnamed Car",
            category: data.category || category,
            price: Number(data.pricePerDay ?? data.price ?? 0),
            pricePerDay: Number(
              data.pricePerDay ?? data.price ?? 0
            ),
            imageUrl: data.imageUrl || "",
            image: data.imageUrl || data.image || "",
            fuelType: data.fuelType || data.fuel || "",
          });

          return;
        }

        const staticCar = getCarBySlug(slug);

        if (
          staticCar &&
          (!category || staticCar.category === category)
        ) {
          setCar(staticCar);
        } else {
          setCar(null);
        }
      } catch (err) {
        console.error("Error loading car:", err);

        if (!cancelled) {
          const staticCar = getCarBySlug(slug);

          if (
            staticCar &&
            (!category || staticCar.category === category)
          ) {
            setCar(staticCar);
          } else {
            setCar(null);
            setError(
              "Car load nahi ho saki. Please refresh karo."
            );
          }
        }
      } finally {
        if (!cancelled) setLoadingCar(false);
      }
    };

    loadCar();

    return () => {
      cancelled = true;
    };
  }, [slug, category]);

  if (loadingCar) {
    return (
      <div className="min-h-screen bg-ink text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
          <p className="text-gray-300">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return <Navigate to="/cars" replace />;
  }

  const booking = car.booking || {};

  const isPending =
    car.status === "pending" ||
    booking.requestStatus === "pending";

  const isBooked =
    car.status === "booked" ||
    booking.isBooked === true ||
    booking.requestStatus === "approved";

  const isUnavailable = isPending || isBooked;

  const pricePerDay = Number(
    car.pricePerDay ?? car.price ?? 0
  );

  const carImages = [
    ...new Set(
      [
        car.imageUrl,
        car.image,
        ...(Array.isArray(car.images) ? car.images : []),
        ...carGalleryImages(car),
      ].filter(
        (image) =>
          typeof image === "string" && image.trim()
      )
    ),
  ];

  const selectedImage =
    carImages[activeImage] ||
    car.imageUrl ||
    car.image ||
    "";

  const relatedCars = getRelatedCars(car)
    .filter((item) => item.slug !== car.slug)
    .slice(0, 3);

  const today = new Date();

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    return Math.floor((end - start) / 86400000);
  };

  const rentalDays = calculateDays();

  const totalPrice =
    rentalDays > 0 ? rentalDays * pricePerDay : 0;

  const submitBooking = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!user) {
      setError("Booking request ke liye pehle login karo.");
      return;
    }

    if (isUnavailable) {
      setError("Ye car filhal available nahi hai.");
      return;
    }

    if (!startDate || !endDate) {
      setError(
        "Please rental ki start aur end date select karo."
      );
      return;
    }

    if (startDate < todayString) {
      setError("Start date aaj ya future ki honi chahiye.");
      return;
    }

    if (endDate <= startDate) {
      setError("End date, start date ke baad honi chahiye.");
      return;
    }

    if (rentalDays < 1) {
      setError("Kam az kam 1 din ki rental select karo.");
      return;
    }

    if (!car.id) {
      setError(
        "Is static car ki booking abhi available nahi. Admin se contact karo."
      );
      return;
    }

    setLoadingBooking(true);

    try {
      const carRef = doc(db, "cars", car.id);
      const bookingRef = doc(collection(db, "bookings"));

      const renterName =
        userData?.name ||
        user.displayName ||
        user.email ||
        "Customer";

      const bookingData = {
        bookingId: bookingRef.id,
        carId: car.id,
        carSlug: car.slug || slug,
        carName: car.name || "Unnamed Car",
        carImage: car.imageUrl || car.image || "",
        carCategory: car.category || category || "car",

        renterId: user.uid,
        renterName,
        renterEmail: user.email || "",

        startDate,
        endDate,
        rentalDays,
        pricePerDay,
        totalPrice,

        status: "pending",
        createdAt: serverTimestamp(),
      };

      await runTransaction(db, async (transaction) => {
        const carSnapshot = await transaction.get(carRef);

        if (!carSnapshot.exists()) {
          throw new Error(
            "Car Firebase mein nahi mili. Page refresh karke dobara try karo."
          );
        }

        const currentCar = carSnapshot.data();
        const currentBooking = currentCar.booking || {};

        const currentlyUnavailable =
          currentCar.status === "pending" ||
          currentCar.status === "booked" ||
          currentCar.status === "unavailable" ||
          currentBooking.isBooked === true ||
          currentBooking.requestStatus === "pending" ||
          currentBooking.requestStatus === "approved";

        if (currentlyUnavailable) {
          throw new Error(
            "Ye car pehle hi request mein hai ya booked hai."
          );
        }

        // Booking request separate collection mein save hogi.
        transaction.set(bookingRef, bookingData);

        // Car ko pending mark karna abhi temporary lock hai.
        // Is update ke liye Firebase Rules mein secure permission
        // configure karna zaroori hai.
        transaction.update(carRef, {
          status: "pending",
          available: false,
          booking: {
            isBooked: false,
            requestStatus: "pending",
            renterId: user.uid,
            renterName,
            renterEmail: user.email || "",
            startDate,
            endDate,
            rentalDays,
            pricePerDay,
            totalPrice,
            bookingId: bookingRef.id,
            createdAt: serverTimestamp(),
          },
        });
      });

      setCar((previous) => ({
        ...previous,
        status: "pending",
        available: false,
        booking: {
          isBooked: false,
          requestStatus: "pending",
          renterId: user.uid,
          renterName,
          renterEmail: user.email || "",
          startDate,
          endDate,
          rentalDays,
          pricePerDay,
          totalPrice,
          bookingId: bookingRef.id,
        },
      }));

      setMessage(
        "Booking request submit ho gayi! Admin approval ke baad booking confirm hogi."
      );

      setStartDate("");
      setEndDate("");
    } catch (err) {
      console.error("Booking request error:", err);

      setError(
        err.message ||
          "Booking request submit nahi ho saki. Dobara try karo."
      );
    } finally {
      setLoadingBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-white">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          to="/cars"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-300 transition hover:text-yellow-400"
        >
          <ArrowLeft size={17} />
          Back to Cars
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-2xl border border-line bg-black">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={car.name}
                  className="h-[280px] w-full object-cover sm:h-[420px]"
                />
              ) : (
                <div className="flex h-[280px] items-center justify-center text-gray-400 sm:h-[420px]">
                  No car image available
                </div>
              )}
            </div>

            {carImages.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {carImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`overflow-hidden rounded-lg border-2 transition ${
                      activeImage === index
                        ? "border-yellow-400"
                        : "border-line hover:border-gray-500"
                    }`}
                    aria-label={`View car image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${car.name} view ${index + 1}`}
                      className="h-16 w-full object-cover sm:h-20"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-yellow-400">
                {car.category || category || "Car"}
              </span>

              {isPending && (
                <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-semibold text-orange-300">
                  Request Pending
                </span>
              )}

              {isBooked && (
                <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300">
                  Booked
                </span>
              )}

              {!isUnavailable && (
                <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-300">
                  Available
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold sm:text-4xl">
              {car.name}
            </h1>

            <p className="mt-4 leading-7 text-gray-300">
              {car.description ||
                "Enjoy your journey with A3 Motors. Contact us for more details about this vehicle."}
            </p>

            <div className="my-6 flex items-end gap-2">
              <span className="text-3xl font-bold text-yellow-400">
                Rs. {pricePerDay.toLocaleString("en-PK")}
              </span>
              <span className="pb-1 text-gray-400">/ day</span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-line p-4">
                <Cog className="mb-2 text-yellow-400" size={21} />
                <p className="text-xs text-gray-400">Transmission</p>
                <p className="mt-1 font-medium">
                  {car.transmission || "Not specified"}
                </p>
              </div>

              <div className="rounded-xl border border-line p-4">
                <Fuel className="mb-2 text-yellow-400" size={21} />
                <p className="text-xs text-gray-400">Fuel Type</p>
                <p className="mt-1 font-medium">
                  {car.fuelType || car.fuel || "Not specified"}
                </p>
              </div>

              <div className="rounded-xl border border-line p-4">
                <Users className="mb-2 text-yellow-400" size={21} />
                <p className="text-xs text-gray-400">Seats</p>
                <p className="mt-1 font-medium">
                  {car.seats || "Not specified"}
                </p>
              </div>
            </div>

            {car.model && (
              <p className="mt-4 text-sm text-gray-300">
                <span className="text-gray-500">Model:</span>{" "}
                {car.model}
              </p>
            )}

            <div className="mt-8 rounded-2xl border border-line bg-white/[0.03] p-5 sm:p-6">
              <h2 className="mb-2 text-xl font-bold">
                Request a Booking
              </h2>

              <p className="mb-5 text-sm text-gray-400">
                Select your rental dates. Your request will be sent
                to the admin for approval.
              </p>

              {message && (
                <div
                  role="status"
                  className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300"
                >
                  <Check className="mr-2 inline" size={17} />
                  {message}
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
                >
                  <X className="mr-2 inline" size={17} />
                  {error}
                </div>
              )}

              {isPending ? (
                <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-orange-200">
                  <CalendarDays className="mr-2 inline" size={18} />
                  Your booking request is waiting for admin approval.

                  {booking.startDate && booking.endDate && (
                    <p className="mt-2">
                      Requested dates: {booking.startDate} to{" "}
                      {booking.endDate}
                    </p>
                  )}
                </div>
              ) : isBooked ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                  This car is currently booked and cannot accept
                  another request.
                </div>
              ) : (
                <form onSubmit={submitBooking} className="space-y-4">
                  <div>
                    <label
                      htmlFor="startDate"
                      className="mb-2 block text-sm text-gray-300"
                    >
                      Rental Start Date
                    </label>

                    <input
                      id="startDate"
                      type="date"
                      min={todayString}
                      value={startDate}
                      onChange={(event) =>
                        setStartDate(event.target.value)
                      }
                      required
                      className="w-full rounded-lg border border-line bg-black/30 px-3 py-3 text-white outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="endDate"
                      className="mb-2 block text-sm text-gray-300"
                    >
                      Rental End Date
                    </label>

                    <input
                      id="endDate"
                      type="date"
                      min={startDate || todayString}
                      value={endDate}
                      onChange={(event) =>
                        setEndDate(event.target.value)
                      }
                      required
                      className="w-full rounded-lg border border-line bg-black/30 px-3 py-3 text-white outline-none focus:border-yellow-400"
                    />
                  </div>

                  {rentalDays > 0 && (
                    <div className="rounded-lg border border-line bg-black/20 p-4">
                      <div className="flex justify-between gap-4 text-sm text-gray-300">
                        <span>Rental duration</span>
                        <span>{rentalDays} day(s)</span>
                      </div>

                      <div className="mt-2 flex justify-between gap-4 font-semibold">
                        <span>Estimated total</span>
                        <span className="text-yellow-400">
                          Rs. {totalPrice.toLocaleString("en-PK")}
                        </span>
                      </div>
                    </div>
                  )}

                  {!user && (
                    <p className="text-sm text-orange-300">
                      Booking submit karne ke liye login zaroori hai.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loadingBooking || isUnavailable}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 px-5 py-3 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingBooking
                      ? "Submitting Request..."
                      : "Submit Booking Request"}

                    {!loadingBooking && <Heart size={18} />}
                  </button>

                  <p className="text-xs leading-5 text-gray-500">
                    Your booking is not confirmed until the admin
                    approves your request.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {relatedCars.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold">
              Related <span className="text-yellow-400">Cars</span>
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCars.map((relatedCar) => (
                <CarCard
                  key={relatedCar.id || relatedCar.slug}
                  car={relatedCar}
                />
              ))}
            </div>
          </section>
        )}
      </section>
    </div>
  );
};

export default CarDetails;