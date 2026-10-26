
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import db from "../firebase/firestore";

const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const categories = [
  "sedan",
  "suv",
  "luxury",
  "sports",
  "hatchback",
  "4x4",
];

const ManageCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "cars"),
      (snapshot) => {
        setCars(
          snapshot.docs.map((carDoc) => ({
            id: carDoc.id,
            ...carDoc.data(),
          }))
        );
        setLoading(false);
      },
      (err) => {
        console.error("Error loading cars:", err);
        setError("Failed to load cars. Check Firebase permissions.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const startEdit = (car) => {
    setError("");
    setSuccess("");
    setEditingId(car.id);
    setEditForm({
      name: car.name || "",
      category: car.category || "sedan",
      pricePerDay: car.pricePerDay ?? car.price ?? "",
      model: car.model || "",
      transmission: car.transmission || "automatic",
      fuelType: car.fuelType || "petrol",
      seats: car.seats ?? 5,
      description: car.description || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setError("");
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const saveEdit = async (car) => {
    setError("");
    setSuccess("");

    const price = Number(editForm.pricePerDay);
    const seats = Number(editForm.seats);

    if (
      !editForm.name.trim() ||
      !editForm.model.trim() ||
      !editForm.description.trim() ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isInteger(seats) ||
      seats < 1
    ) {
      setError("Please enter valid car details, price and seats.");
      return;
    }

    try {
      setSavingId(car.id);

      await updateDoc(doc(db, "cars", car.id), {
        name: editForm.name.trim(),
        category: editForm.category,
        pricePerDay: price,
        model: editForm.model.trim(),
        transmission: editForm.transmission,
        fuelType: editForm.fuelType,
        seats,
        description: editForm.description.trim(),
      });

      setSuccess(`${editForm.name.trim()} updated successfully.`);
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      console.error("Error updating car:", err);
      setError(
        "Could not update car. Check your internet connection and Firebase permissions."
      );
    } finally {
      setSavingId(null);
    }
  };

  const uploadImage = async (file, folder) => {
    if (!file) return "";

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error(
        "Cloudinary settings are missing from your .env file."
      );
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("Please select an image file.");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Each image must be smaller than 5 MB.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", `a3-motors/cars/${folder}`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Cloudinary error:", data);
      throw new Error("Image upload failed.");
    }

    return data.secure_url;
  };

  const handleImageUpdate = async (car) => {
    setError("");
    setSuccess("");

    const getFile = (type) =>
      document.getElementById(`${type}-${car.id}`)?.files?.[0];

    const files = {
      front: getFile("front"),
      side: getFile("side"),
      interior: getFile("interior"),
      back: getFile("back"),
    };

    if (!Object.values(files).some(Boolean)) {
      setError("Please select at least one image.");
      return;
    }

    try {
      setUploadingId(car.id);

      const oldImages = car.images || {};
      const images = {
        front: oldImages.front || car.imageUrl || "",
        side: oldImages.side || "",
        interior: oldImages.interior || "",
        back: oldImages.back || "",
      };

      for (const type of ["front", "side", "interior", "back"]) {
        if (files[type]) {
          images[type] = await uploadImage(files[type], type);
        }
      }

      await updateDoc(doc(db, "cars", car.id), {
        images,
        imageUrl: images.front,
      });

      Object.keys(files).forEach((type) => {
        const input = document.getElementById(`${type}-${car.id}`);
        if (input) input.value = "";
      });

      setSuccess(`${car.name} images updated successfully.`);
    } catch (err) {
      console.error("Error updating images:", err);
      setError(err.message || "Failed to upload/update images.");
    } finally {
      setUploadingId(null);
    }
  };

  const handleDelete = async (car) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${car.name || "this car"}?`
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      setDeletingId(car.id);
      await deleteDoc(doc(db, "cars", car.id));
      setSuccess(`${car.name || "Car"} deleted successfully.`);
    } catch (err) {
      console.error("Error deleting car:", err);
      setError("Failed to delete car. Check Firebase permissions.");
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-line bg-black/40 px-3 py-2 text-cream outline-none focus:border-yellow-400";

  return (
    <div className="min-h-screen bg-ink p-6 text-cream md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link to="/admin" className="text-sm text-gold hover:underline">
              ← Back to Admin Dashboard
            </Link>
            <h1 className="mt-4 text-3xl font-bold md:text-4xl">
              Manage Cars
            </h1>
            <p className="mt-2 text-gray-400">
              Edit vehicle details, replace pictures or delete cars.
            </p>
          </div>

          <Link
            to="/admin/add-car"
            className="rounded-lg bg-gold px-5 py-3 text-center font-semibold text-black hover:opacity-90"
          >
            + Add New Car
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500 bg-red-500/10 px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-500 bg-green-500/10 px-4 py-3 text-green-400">
            {success}
          </div>
        )}

        {loading && (
          <p className="py-20 text-center text-gold">Loading cars...</p>
        )}

        {!loading && cars.length === 0 && (
          <div className="rounded-xl border border-line p-10 text-center">
            <h2 className="text-2xl font-semibold">No Cars Found</h2>
            <p className="mt-2 text-gray-400">
              Add your first car using Add New Car.
            </p>
          </div>
        )}

        {!loading && cars.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {cars.map((car) => {
              const images = car.images || {};
              const isEditing = editingId === car.id;

              return (
                <div
                  key={car.id}
                  className="overflow-hidden rounded-2xl border border-line bg-black/20"
                >
                  <div className="h-56 bg-black">
                    {car.imageUrl || images.front ? (
                      <img
                        src={images.front || car.imageUrl}
                        alt={car.name || "Car"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-500">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold">
                          {car.name || "Unnamed Car"}
                        </h2>
                        <p className="mt-1 capitalize text-gray-400">
                          {car.category || "Uncategorized"}
                        </p>
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs capitalize">
                        {car.status || "available"}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="mt-5 space-y-4">
                        <label className="block text-sm">
                          Car Name
                          <input
                            className={inputClass}
                            name="name"
                            value={editForm.name}
                            onChange={handleFieldChange}
                          />
                        </label>

                        <label className="block text-sm">
                          Category
                          <select
                            className={inputClass}
                            name="category"
                            value={editForm.category}
                            onChange={handleFieldChange}
                          >
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="block text-sm">
                          Price Per Day (Rs.)
                          <input
                            className={inputClass}
                            type="number"
                            min="1"
                            name="pricePerDay"
                            value={editForm.pricePerDay}
                            onChange={handleFieldChange}
                          />
                        </label>

                        <label className="block text-sm">
                          Model
                          <input
                            className={inputClass}
                            name="model"
                            value={editForm.model}
                            onChange={handleFieldChange}
                          />
                        </label>

                        <label className="block text-sm">
                          Transmission
                          <select
                            className={inputClass}
                            name="transmission"
                            value={editForm.transmission}
                            onChange={handleFieldChange}
                          >
                            <option value="automatic">Automatic</option>
                            <option value="manual">Manual</option>
                          </select>
                        </label>

                        <label className="block text-sm">
                          Fuel Type
                          <select
                            className={inputClass}
                            name="fuelType"
                            value={editForm.fuelType}
                            onChange={handleFieldChange}
                          >
                            <option value="petrol">Petrol</option>
                            <option value="diesel">Diesel</option>
                            <option value="hybrid">Hybrid</option>
                            <option value="electric">Electric</option>
                          </select>
                        </label>

                        <label className="block text-sm">
                          Seats
                          <input
                            className={inputClass}
                            type="number"
                            min="1"
                            step="1"
                            name="seats"
                            value={editForm.seats}
                            onChange={handleFieldChange}
                          />
                        </label>

                        <label className="block text-sm">
                          Description
                          <textarea
                            className={inputClass}
                            rows="4"
                            name="description"
                            value={editForm.description}
                            onChange={handleFieldChange}
                          />
                        </label>

                        <button
                          onClick={() => saveEdit(car)}
                          disabled={savingId === car.id}
                          className="w-full rounded-lg bg-gold px-4 py-2.5 font-semibold text-black disabled:opacity-50"
                        >
                          {savingId === car.id ? "Saving..." : "Save Changes"}
                        </button>

                        <button
                          onClick={cancelEdit}
                          disabled={savingId === car.id}
                          className="w-full rounded-lg border border-line px-4 py-2.5 hover:bg-white/5"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mt-4 space-y-2 text-sm text-gray-300">
                          <p>
                            <span className="text-gray-500">Price:</span>{" "}
                            Rs.{" "}
                            {Number(
                              car.pricePerDay ?? car.price ?? 0
                            ).toLocaleString()}
                            /day
                          </p>
                          <p>
                            <span className="text-gray-500">Model:</span>{" "}
                            {car.model || "Not specified"}
                          </p>
                          <p>
                            <span className="text-gray-500">
                              Transmission:
                            </span>{" "}
                            <span className="capitalize">
                              {car.transmission || "Not specified"}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-500">Fuel:</span>{" "}
                            <span className="capitalize">
                              {car.fuelType || "Not specified"}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-500">Seats:</span>{" "}
                            {car.seats ?? "Not specified"}
                          </p>
                          <p className="whitespace-pre-wrap text-gray-400">
                            {car.description || "No description"}
                          </p>
                        </div>

                        <button
                          onClick={() => startEdit(car)}
                          className="mt-5 w-full rounded-lg bg-gold px-4 py-2.5 font-semibold text-black hover:opacity-90"
                        >
                          Edit Car Details
                        </button>
                      </>
                    )}

                    <div className="mt-6 border-t border-line pt-5">
                      <h3 className="mb-3 text-sm font-semibold text-gold">
                        Current Images
                      </h3>

                      <div className="grid grid-cols-4 gap-2">
                        {[
                          {
                            label: "Front",
                            src: images.front || car.imageUrl,
                          },
                          { label: "Side", src: images.side },
                          { label: "Interior", src: images.interior },
                          { label: "Back", src: images.back },
                        ].map((image) => (
                          <div key={image.label}>
                            <div className="h-16 overflow-hidden rounded-md border border-line bg-black">
                              {image.src ? (
                                <img
                                  src={image.src}
                                  alt={image.label}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[10px] text-gray-600">
                                  None
                                </div>
                              )}
                            </div>
                            <p className="mt-1 text-center text-[10px] text-gray-500">
                              {image.label}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 space-y-3">
                        {[
                          { type: "front", label: "Front Image" },
                          { type: "side", label: "Side Image" },
                          { type: "interior", label: "Interior Image" },
                          { type: "back", label: "Back Image" },
                        ].map(({ type, label }) => (
                          <label
                            key={type}
                            className="block text-xs text-gray-400"
                          >
                            {label}
                            <input
                              id={`${type}-${car.id}`}
                              type="file"
                              accept="image/*"
                              className="mt-1 w-full text-xs"
                            />
                          </label>
                        ))}
                      </div>

                      <button
                        onClick={() => handleImageUpdate(car)}
                        disabled={
                          uploadingId === car.id ||
                          deletingId === car.id
                        }
                        className="mt-4 w-full rounded-lg bg-gold px-4 py-2.5 font-semibold text-black disabled:opacity-50"
                      >
                        {uploadingId === car.id
                          ? "Uploading Images..."
                          : "Save Images"}
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(car)}
                      disabled={
                        deletingId === car.id ||
                        uploadingId === car.id ||
                        savingId === car.id
                      }
                      className="mt-5 w-full rounded-lg border border-red-500 px-4 py-2 text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                    >
                      {deletingId === car.id ? "Deleting..." : "Delete Car"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCars;
