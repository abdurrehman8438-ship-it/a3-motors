import { useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import db from "../firebase/firestore";

const makeSlug = (name, category, id) => {
  const base = `${category || "car"}-${name || "vehicle"}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${base}-${id.slice(-6)}`;
};

const MigrateCars = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleMigration = async () => {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const carsRef = collection(db, "cars");
      const snapshot = await getDocs(carsRef);

      let updatedCount = 0;

      for (const carDoc of snapshot.docs) {
        const car = carDoc.data();

        const booking = {
          isBooked: car.booking?.isBooked ?? false,
          renterId: car.booking?.renterId ?? "",
          renterName: car.booking?.renterName ?? "",
          renterEmail: car.booking?.renterEmail ?? "",
          renterCnic: car.booking?.renterCnic ?? "",
          startDate: car.booking?.startDate ?? "",
          endDate: car.booking?.endDate ?? "",
          rentalDays: car.booking?.rentalDays ?? 0,
        };

        const updates = {
          slug:
            car.slug ||
            makeSlug(car.name, car.category, carDoc.id),

          booking,

          status:
            car.status ||
            (booking.isBooked ? "booked" : "available"),
        };

        await updateDoc(
          doc(db, "cars", carDoc.id),
          updates
        );

        updatedCount++;
      }

      setMessage(
        `Migration complete! ${updatedCount} car(s) updated successfully.`
      );
    } catch (err) {
      console.error("Migration error:", err);
      setError(
        "Migration failed. Check the browser console for details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-cream p-6 md:p-10">
      <div className="max-w-3xl mx-auto">

        <Link
          to="/admin"
          className="text-gold hover:underline text-sm"
        >
          ← Back to Admin Dashboard
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mt-6">
          Migrate Existing Cars
        </h1>

        <p className="text-gray-400 mt-3">
          This will add the new slug, booking and status
          fields to your existing cars.
        </p>

        <div className="mt-8 border border-line rounded-xl p-6 bg-black/20">

          <p className="text-gray-300">
            Existing cars will NOT be deleted.
          </p>

          <p className="text-gray-400 mt-2 text-sm">
            This is a one-time migration for the cars
            already stored in Firebase.
          </p>

          {message && (
            <div className="mt-5 border border-green-500 bg-green-500/10 text-green-400 rounded-lg px-4 py-3">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-5 border border-red-500 bg-red-500/10 text-red-400 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            onClick={handleMigration}
            disabled={loading}
            className="mt-6 px-6 py-3 rounded-lg bg-gold text-black font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading
              ? "Migrating Cars..."
              : "Migrate Existing Cars"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default MigrateCars;