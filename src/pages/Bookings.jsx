import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";

import db from "../firebase/firestore";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "bookings"),
      (snapshot) => {
        const allBookings = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        allBookings.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        });

        setBookings(allBookings);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("Bookings load error:", err);
        setError(
          "Booking requests load nahi ho sakin. Firebase permissions check karein."
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const approveBooking = async (booking) => {
    if (booking.status !== "pending") {
      alert("Yeh request ab pending nahi hai.");
      return;
    }

    const confirmed = window.confirm(
      `Approve booking for ${booking.carName || "this car"}?`
    );

    if (!confirmed) return;

    setProcessingId(booking.id);
    setError("");

    try {
      await runTransaction(db, async (transaction) => {
        const bookingRef = doc(db, "bookings", booking.id);
        const bookingSnapshot = await transaction.get(bookingRef);

        if (!bookingSnapshot.exists()) {
          throw new Error("Booking request nahi mili.");
        }

        const currentBooking = bookingSnapshot.data();

        if (currentBooking.status !== "pending") {
          throw new Error(
            "Yeh booking pehle hi process ho chuki hai."
          );
        }

        const carRef = doc(db, "cars", currentBooking.carId);
        const carSnapshot = await transaction.get(carRef);

        if (!carSnapshot.exists()) {
          throw new Error("Related car Firebase mein nahi mili.");
        }

        const car = carSnapshot.data();
        const currentCarBooking = car.booking || {};

        // Agar car kisi doosri pending request ya booking mein hai,
        // to is request ko approve nahi karna.
        if (
          currentCarBooking.bookingId &&
          currentCarBooking.bookingId !== booking.id
        ) {
          throw new Error(
            "Car par doosri booking request maujood hai."
          );
        }

        if (
          car.status === "booked" &&
          currentCarBooking.bookingId !== booking.id
        ) {
          throw new Error("Yeh car pehle hi booked hai.");
        }

        transaction.update(bookingRef, {
          status: "approved",
          approvedAt: serverTimestamp(),
        });

        transaction.update(carRef, {
          status: "booked",
          available: false,
          booking: {
            ...currentCarBooking,
            bookingId: booking.id,
            isBooked: true,
            requestStatus: "approved",
            renterId: currentBooking.renterId || "",
            renterName: currentBooking.renterName || "",
            renterEmail: currentBooking.renterEmail || "",
            startDate: currentBooking.startDate || "",
            endDate: currentBooking.endDate || "",
            rentalDays: Number(currentBooking.rentalDays) || 0,
            pricePerDay:
              Number(currentBooking.pricePerDay) || 0,
            totalPrice: Number(currentBooking.totalPrice) || 0,
            approvedAt: serverTimestamp(),
          },
        });
      });

      alert("Booking approved successfully.");
    } catch (err) {
      console.error("Approve booking error:", err);
      setError(err.message || "Booking approve nahi hui.");
    } finally {
      setProcessingId("");
    }
  };

  const rejectBooking = async (booking) => {
    if (booking.status !== "pending") {
      alert("Yeh request ab pending nahi hai.");
      return;
    }

    const confirmed = window.confirm(
      `Reject booking for ${booking.carName || "this car"}?`
    );

    if (!confirmed) return;

    setProcessingId(booking.id);
    setError("");

    try {
      await runTransaction(db, async (transaction) => {
        const bookingRef = doc(db, "bookings", booking.id);
        const bookingSnapshot = await transaction.get(bookingRef);

        if (!bookingSnapshot.exists()) {
          throw new Error("Booking request nahi mili.");
        }

        const currentBooking = bookingSnapshot.data();

        if (currentBooking.status !== "pending") {
          throw new Error(
            "Yeh booking pehle hi process ho chuki hai."
          );
        }

        const carRef = doc(db, "cars", currentBooking.carId);
        const carSnapshot = await transaction.get(carRef);

        transaction.update(bookingRef, {
          status: "rejected",
          rejectedAt: serverTimestamp(),
        });

        if (carSnapshot.exists()) {
          const car = carSnapshot.data();
          const currentCarBooking = car.booking || {};

          // Sirf isi request ka lock clear karo.
          if (
            currentCarBooking.bookingId === booking.id ||
            currentCarBooking.renterId === currentBooking.renterId
          ) {
            transaction.update(carRef, {
              status: "available",
              available: true,
              booking: {
                isBooked: false,
                requestStatus: "rejected",
                bookingId: booking.id,
                renterId: "",
                renterName: "",
                renterEmail: "",
                startDate: "",
                endDate: "",
                rentalDays: 0,
                pricePerDay: 0,
                totalPrice: 0,
                rejectedAt: serverTimestamp(),
              },
            });
          }
        }
      });

      alert("Booking rejected.");
    } catch (err) {
      console.error("Reject booking error:", err);
      setError(err.message || "Booking reject nahi hui.");
    } finally {
      setProcessingId("");
    }
  };

  const formatDate = (value) => {
    if (!value) return "Not selected";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString();
  };

  const formatMoney = (value) =>
    Number(value || 0).toLocaleString("en-PK");

  const getStatusClass = (status) => {
    if (status === "pending") {
      return "bg-yellow-400/15 text-yellow-400";
    }

    if (status === "approved") {
      return "bg-green-400/15 text-green-400";
    }

    if (status === "rejected") {
      return "bg-red-400/15 text-red-400";
    }

    return "bg-white/10 text-gray-300";
  };

  return (
    <div className="min-h-screen bg-ink px-4 py-10 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-yellow-400">
              A3 Motors
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Booking Requests
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Review customer requests and approve or reject them.
            </p>
          </div>

          <Link
            to="/admin"
            className="rounded-lg border border-yellow-400 px-5 py-3 font-semibold text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
          >
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-gray-400">
            Loading booking requests...
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-xl font-semibold">
              No booking requests yet
            </h2>

            <p className="mt-2 text-gray-400">
              New customer requests will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {bookings.map((booking) => {
              const rentalDays = Number(booking.rentalDays) || 0;
              const pricePerDay =
                Number(booking.pricePerDay) || 0;

              const totalPrice =
                booking.totalPrice != null
                  ? Number(booking.totalPrice)
                  : rentalDays * pricePerDay;

              const isPending = booking.status === "pending";
              const isProcessing = processingId === booking.id;

              return (
                <div
                  key={booking.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                >
                  {booking.carImage && (
                    <img
                      src={booking.carImage}
                      alt={booking.carName || "Rental car"}
                      className="h-56 w-full object-cover"
                    />
                  )}

                  <div className="p-5 sm:p-6">
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold">
                          {booking.carName || "Unnamed Car"}
                        </h2>

                        <p className="mt-1 text-sm text-gray-400">
                          {booking.carCategory || "Car"} · PKR{" "}
                          {formatMoney(pricePerDay)} / day
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusClass(
                          booking.status
                        )}`}
                      >
                        {booking.status || "Unknown"}
                      </span>
                    </div>

                    <div className="space-y-3 rounded-xl bg-black/20 p-4">
                      <h3 className="font-semibold text-yellow-400">
                        Customer Details
                      </h3>

                      <p className="break-words text-sm text-gray-300">
                        <span className="text-gray-500">Name:</span>{" "}
                        {booking.renterName || "Not available"}
                      </p>

                      <p className="break-words text-sm text-gray-300">
                        <span className="text-gray-500">Email:</span>{" "}
                        {booking.renterEmail || "Not available"}
                      </p>

                      <p className="break-words text-sm text-gray-300">
                        <span className="text-gray-500">
                          Customer UID:
                        </span>{" "}
                        {booking.renterId || "Not available"}
                      </p>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-gray-500">
                            Rental Start
                          </p>

                          <p className="mt-1 text-sm text-gray-300">
                            {formatDate(booking.startDate)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Rental End
                          </p>

                          <p className="mt-1 text-sm text-gray-300">
                            {formatDate(booking.endDate)}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-white/10 pt-3">
                        <p className="text-sm text-gray-300">
                          Rental duration:{" "}
                          <span className="font-semibold text-white">
                            {rentalDays || "Not available"} days
                          </span>
                        </p>

                        <p className="mt-2 text-sm text-gray-300">
                          Estimated total:{" "}
                          <span className="font-bold text-yellow-400">
                            PKR {formatMoney(totalPrice)}
                          </span>
                        </p>
                      </div>
                    </div>

                    {isPending && (
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => approveBooking(booking)}
                          disabled={isProcessing}
                          className="flex-1 rounded-lg bg-green-500 px-4 py-3 font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isProcessing
                            ? "Processing..."
                            : "Approve Booking"}
                        </button>

                        <button
                          type="button"
                          onClick={() => rejectBooking(booking)}
                          disabled={isProcessing}
                          className="flex-1 rounded-lg border border-red-400 px-4 py-3 font-semibold text-red-400 transition hover:bg-red-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isProcessing
                            ? "Processing..."
                            : "Reject Booking"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}