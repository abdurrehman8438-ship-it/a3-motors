import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import db from "../firebase/firestore";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const createSlug = (name, category) => {
  const baseSlug = `${category}-${name}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${baseSlug}-${Date.now()}`;
};

const AddCar = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    pricePerDay: "",
    model: "",
    transmission: "automatic",
    fuelType: "petrol",
    seats: "5",
    description: "",
  });

  const [images, setImages] = useState({
    front: null,
    side: null,
    interior: null,
    back: null,
  });

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ---------------------------------
     Form Change
  --------------------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ---------------------------------
     Image Change
  --------------------------------- */
  const handleImageChange = (type, file) => {
    setImages((previous) => ({
      ...previous,
      [type]: file,
    }));
  };

  /* ---------------------------------
     Upload Image to Cloudinary
  --------------------------------- */
  const uploadToCloudinary = async (file, imageType) => {
    if (!file) {
      throw new Error(
        `${imageType} image is required.`
      );
    }

    const cloudinaryFormData = new FormData();

    cloudinaryFormData.append(
      "file",
      file
    );

    cloudinaryFormData.append(
      "upload_preset",
      UPLOAD_PRESET
    );

    cloudinaryFormData.append(
      "folder",
      `a3-motors/cars/${imageType}`
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Cloudinary error:",
        data
      );

      throw new Error(
        data?.error?.message ||
          `Failed to upload ${imageType} image.`
      );
    }

    return data.secure_url;
  };

  /* ---------------------------------
     Submit
  --------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Required fields
    if (
      !formData.name ||
      !formData.category ||
      !formData.pricePerDay ||
      !formData.model
    ) {
      setError(
        "Please fill all required car details."
      );
      return;
    }

    // Required 4 images
    if (!images.front) {
      setError(
        "Please select the Front image."
      );
      return;
    }

    if (!images.side) {
      setError(
        "Please select the Side image."
      );
      return;
    }

    if (!images.interior) {
      setError(
        "Please select the Interior image."
      );
      return;
    }

    if (!images.back) {
      setError(
        "Please select the Back image."
      );
      return;
    }

    try {
      setUploading(true);

      /* ---------------------------------
         Upload 4 Images
      --------------------------------- */

      const frontUrl =
        await uploadToCloudinary(
          images.front,
          "front"
        );

      const sideUrl =
        await uploadToCloudinary(
          images.side,
          "side"
        );

      const interiorUrl =
        await uploadToCloudinary(
          images.interior,
          "interior"
        );

      const backUrl =
        await uploadToCloudinary(
          images.back,
          "back"
        );

      /* ---------------------------------
         Create Slug
      --------------------------------- */

      const slug = createSlug(
        formData.name,
        formData.category
      );

      /* ---------------------------------
         Save Car in Firestore
      --------------------------------- */

      await addDoc(
        collection(db, "cars"),
        {
          name: formData.name,

          category: formData.category,

          pricePerDay:
            Number(formData.pricePerDay),

          model: formData.model,

          transmission:
            formData.transmission,

          fuelType:
            formData.fuelType,

          seats:
            Number(formData.seats),

          description:
            formData.description,

          slug,

          /* 4 Car Images */
          images: {
            front: frontUrl,
            side: sideUrl,
            interior: interiorUrl,
            back: backUrl,
          },

          /* Main image */
          imageUrl: frontUrl,

          status: "available",

          booking: {
            isBooked: false,
            renterId: "",
            renterName: "",
            renterEmail: "",
            renterCnic: "",
            startDate: "",
            endDate: "",
            rentalDays: 0,
          },

          createdAt:
            serverTimestamp(),
        }
      );

      setSuccess(
        "Car added successfully with all 4 images!"
      );

      setTimeout(() => {
        navigate("/admin/manage-cars");
      }, 1500);

    } catch (err) {
      console.error(
        "Add car error:",
        err
      );

      setError(
        err.message ||
          "Failed to add car."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-cream p-6 md:p-10">

      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <Link
          to="/admin"
          className="text-gold hover:underline text-sm"
        >
          ← Back to Admin Dashboard
        </Link>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold mt-6">
          Add New Car
        </h1>

        <p className="text-gray-400 mt-2">
          Add a new vehicle with four professional
          images.
        </p>

        {/* Error */}
        {error && (
          <div className="mt-6 border border-red-500 bg-red-500/10 text-red-400 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mt-6 border border-green-500 bg-green-500/10 text-green-400 rounded-lg px-4 py-3">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 border border-line rounded-2xl p-6 md:p-8 bg-black/20"
        >

          {/* ---------------------------------
              Car Information
          --------------------------------- */}

          <h2 className="text-xl font-bold mb-5">
            Car Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Name */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Car Name *
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Toyota Corolla"
                className="w-full bg-ink border border-line rounded-lg px-4 py-3 outline-none focus:border-gold"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Category *
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-ink border border-line rounded-lg px-4 py-3 outline-none focus:border-gold"
              >
                <option value="">
                  Select Category
                </option>

                <option value="sedan">
                  Sedan
                </option>

                <option value="suv">
                  SUV
                </option>

                <option value="luxury">
                  Luxury
                </option>

                <option value="sports">
                  Sports
                </option>

                <option value="hatchback">
                  Hatchback
                </option>

                <option value="4x4">
                  4x4
                </option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Price Per Day (Rs.) *
              </label>

              <input
                type="number"
                name="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleChange}
                placeholder="15000"
                min="0"
                className="w-full bg-ink border border-line rounded-lg px-4 py-3 outline-none focus:border-gold"
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Model / Year *
              </label>

              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="2025"
                className="w-full bg-ink border border-line rounded-lg px-4 py-3 outline-none focus:border-gold"
              />
            </div>

            {/* Transmission */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Transmission
              </label>

              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                className="w-full bg-ink border border-line rounded-lg px-4 py-3 outline-none focus:border-gold"
              >
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
                Fuel Type
              </label>

              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="w-full bg-ink border border-line rounded-lg px-4 py-3 outline-none focus:border-gold"
              >
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

            {/* Seats */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Seats
              </label>

              <input
                type="number"
                name="seats"
                value={formData.seats}
                onChange={handleChange}
                min="1"
                max="20"
                className="w-full bg-ink border border-line rounded-lg px-4 py-3 outline-none focus:border-gold"
              />
            </div>

          </div>

          {/* Description */}
          <div className="mt-5">

            <label className="block text-sm text-gray-400 mb-2">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              placeholder="Enter car description..."
              className="w-full bg-ink border border-line rounded-lg px-4 py-3 outline-none focus:border-gold resize-none"
            />

          </div>

          {/* ---------------------------------
              Images
          --------------------------------- */}

          <div className="mt-10">

            <h2 className="text-xl font-bold">
              Car Images
            </h2>

            <p className="text-gray-400 text-sm mt-2 mb-6">
              Upload four images: Front, Side,
              Interior and Back.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Front */}
              <ImageInput
                label="Front Image *"
                file={images.front}
                onChange={(file) =>
                  handleImageChange(
                    "front",
                    file
                  )
                }
              />

              {/* Side */}
              <ImageInput
                label="Side Image *"
                file={images.side}
                onChange={(file) =>
                  handleImageChange(
                    "side",
                    file
                  )
                }
              />

              {/* Interior */}
              <ImageInput
                label="Interior Image *"
                file={images.interior}
                onChange={(file) =>
                  handleImageChange(
                    "interior",
                    file
                  )
                }
              />

              {/* Back */}
              <ImageInput
                label="Back Image *"
                file={images.back}
                onChange={(file) =>
                  handleImageChange(
                    "back",
                    file
                  )
                }
              />

            </div>

          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full mt-10 px-6 py-4 bg-gold text-black rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50"
          >
            {uploading
              ? "Uploading 4 Images & Saving Car..."
              : "Add Car"}
          </button>

        </form>

      </div>
    </div>
  );
};

/* ---------------------------------
   Image Input Component
--------------------------------- */

const ImageInput = ({
  label,
  file,
  onChange,
}) => {
  return (
    <div className="border border-line rounded-xl p-4">

      <label className="block text-sm text-gray-300 mb-3">
        {label}
      </label>

      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          onChange(
            e.target.files?.[0] || null
          )
        }
        className="w-full text-sm text-gray-400"
      />

      {file && (
        <div className="mt-4">

          <img
            src={URL.createObjectURL(file)}
            alt={label}
            className="w-full h-40 object-cover rounded-lg border border-line"
          />

          <p className="text-xs text-green-400 mt-2">
            ✓ {file.name}
          </p>

        </div>
      )}

    </div>
  );
};

export default AddCar;