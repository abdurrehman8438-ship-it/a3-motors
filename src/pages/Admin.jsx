
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import db from "../firebase/firestore";
import { importStaticCars } from "../utils/importStaticCars";

const Admin = () => {
  const { userData, logout } = useAuth();

  const [cars, setCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [importError, setImportError] = useState("");

  useEffect(() => {
    const carsRef = collection(db, "cars");

    const unsubscribe = onSnapshot(
      carsRef,
      (snapshot) => {
        const carsData = snapshot.docs.map((carDoc) => ({
          id: carDoc.id,
          ...carDoc.data(),
        }));

        setCars(carsData);
        setLoadingCars(false);
      },
      (error) => {
        console.error("Error loading cars:", error);
        setLoadingCars(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleImportCars = async () => {
    const confirmed = window.confirm(
      "Static cars ko Firestore mein import karna hai? Existing cars ke same slugs skip honge."
    );

    if (!confirmed) return;

    setIsImporting(true);
    setImportMessage("");
    setImportError("");

    try {
      const result = await importStaticCars();

      setImportMessage(
        `Import complete! New: ${result.imported}, existing IDs reused: ${result.reused}, skipped: ${result.skipped}, total static cars: ${result.total}.`
      );
    } catch (error) {
      console.error("Static car import failed:", error);

      setImportError(
        error.code === "permission-denied"
          ? "Permission denied. Confirm karo ke tum admin account se login ho aur Firestore rules allow karte hain."
          : error.message || "Cars import nahi ho sakin."
      );
    } finally {
      setIsImporting(false);
    }
  };

  const totalCars = cars.length;

  const pendingBookings = cars.filter(
    (car) =>
      car.status === "pending" ||
      car.booking?.requestStatus === "pending"
  ).length;

  const bookedCars = cars.filter(
    (car) =>
      car.status === "booked" ||
      car.booking?.requestStatus === "approved" ||
      car.booking?.isBooked === true
  ).length;

  const availableCars = cars.filter((car) => {
    const isPending =
      car.status === "pending" ||
      car.booking?.requestStatus === "pending";

    const isBooked =
      car.status === "booked" ||
      car.booking?.requestStatus === "approved" ||
      car.booking?.isBooked === true;

    return (
      !isPending &&
      !isBooked &&
      car.status !== "unavailable"
    );
  }).length;

  return (
    <div className="min-h-screen bg-ink text-cream p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <p className="text-gold uppercase tracking-widest text-sm">
              A3 Motors
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-2">
              Admin Dashboard
            </h1>

            <p className="text-gray-400 mt-2">
              Welcome, {userData?.name || "Admin"}
            </p>
          </div>

          <button
            onClick={logout}
            className="px-5 py-3 rounded-lg border border-gold text-gold hover:bg-gold hover:text-black transition"
          >
            Logout
          </button>
        </div>

        {/* Car Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="border border-line rounded-xl p-6 bg-black/20">
            <p className="text-gray-400">Total Cars</p>
            <h2 className="text-3xl font-bold text-gold mt-2">
              {loadingCars ? "..." : totalCars}
            </h2>
          </div>

          <div className="border border-line rounded-xl p-6 bg-black/20">
            <p className="text-gray-400">Available Cars</p>
            <h2 className="text-3xl font-bold text-green-400 mt-2">
              {loadingCars ? "..." : availableCars}
            </h2>
          </div>

          <div className="border border-line rounded-xl p-6 bg-black/20">
            <p className="text-gray-400">Pending Bookings</p>
            <h2 className="text-3xl font-bold text-yellow-400 mt-2">
              {loadingCars ? "..." : pendingBookings}
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Waiting for admin approval
            </p>
          </div>

          <div className="border border-line rounded-xl p-6 bg-black/20">
            <p className="text-gray-400">Booked Cars</p>
            <h2 className="text-3xl font-bold text-red-400 mt-2">
              {loadingCars ? "..." : bookedCars}
            </h2>
          </div>
        </div>

        {/* Import Static Cars */}
        <div className="mt-10 border border-gold rounded-xl p-6 bg-black/20">
          <h2 className="text-xl font-semibold">
            Import Static Cars
          </h2>

          <p className="text-gray-400 text-sm mt-2">
            src/data/cars.js ki cars ko Firestore mein add karo.
            Same slug wali existing cars skip hongi.
          </p>

          <button
            onClick={handleImportCars}
            disabled={isImporting}
            className="mt-5 px-5 py-3 rounded-lg bg-gold text-black font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isImporting ? "Importing Cars..." : "Import Static Cars"}
          </button>

          {importMessage && (
            <p className="mt-4 text-green-400 break-words">
              {importMessage}
            </p>
          )}

          {importError && (
            <p className="mt-4 text-red-400 break-words">
              {importError}
            </p>
          )}
        </div>

        {/* Admin Actions */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-5">
            Admin Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <Link
              to="/admin/add-car"
              className="border border-gold rounded-xl p-6 hover:bg-gold hover:text-black transition block"
            >
              <h3 className="text-xl font-semibold">Add New Car</h3>
              <p className="text-sm mt-2 opacity-70">
                Add a new vehicle to A3 Motors.
              </p>
            </Link>

            <Link
              to="/admin/manage-cars"
              className="border border-line rounded-xl p-6 hover:border-gold transition block"
            >
              <h3 className="text-xl font-semibold">Manage Cars</h3>
              <p className="text-sm text-gray-400 mt-2">
                View and manage all vehicles.
              </p>
            </Link>

            <Link
              to="/admin/bookings"
              className="border border-line rounded-xl p-6 hover:border-gold transition block"
            >
              <h3 className="text-xl font-semibold">Bookings</h3>
              <p className="text-sm text-gray-400 mt-2">
                Review requests and manage customer bookings.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
