import { useRef, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

import auth from "../firebase/auth";
import db from "../firebase/firestore";

const Signup = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [cnic, setCnic] = useState(Array(13).fill(""));

  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // CNIC input handling
  const handleCnicChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const updatedCnic = [...cnic];
    updatedCnic[index] = value;

    setCnic(updatedCnic);

    if (value && index < 12) {
      document.getElementById(`cnic-${index + 1}`)?.focus();
    }
  };

  // CNIC backspace handling
  const handleCnicKeyDown = (index, e) => {
    if (e.key === "Backspace" && !cnic[index] && index > 0) {
      document.getElementById(`cnic-${index - 1}`)?.focus();
    }
  };

  // Profile image select
  const handleProfileImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Only allow images
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    // Maximum 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("Profile picture must be less than 5MB.");
      return;
    }

    setError("");
    setProfileImage(file);

    // Preview
    const previewUrl = URL.createObjectURL(file);
    setProfilePreview(previewUrl);
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary configuration is missing.");
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Image upload failed.");
    }

    return data.secure_url;
  };

  // Signup
  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanCnic = cnic.join("");

    // Validation
    if (!cleanName) {
      setError("Please enter your name.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    if (cleanCnic.length !== 13) {
      setError("CNIC must contain exactly 13 digits.");
      return;
    }

    if (!profileImage) {
      setError("Please select your profile picture.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // 1. Upload profile picture to Cloudinary
      const profileImageUrl =
        await uploadImageToCloudinary(profileImage);

      // 2. Create Firebase Authentication account
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );

      const user = userCredential.user;

      // 3. Save user information in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: cleanName,
        email: cleanEmail,
        cnic: cleanCnic,
        profileImage: profileImageUrl,
        role: "user",
        createdAt: serverTimestamp(),
      });

      setSuccess("Account created successfully!");

      // 4. Go to Home page
      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      console.error(err);

      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak.");
      } else {
        setError(err.message || "Signup failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-panel rounded-2xl p-6 md:p-8 shadow-xl">

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gold">
            Create Account
          </h1>

          <p className="text-gray-400 mt-2">
            Join A3 Motors
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block mb-2">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 rounded-lg bg-ink border border-gray-700 focus:border-gold outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg bg-ink border border-gray-700 focus:border-gold outline-none"
            />
          </div>

          {/* CNIC */}
          <div>
            <label className="block mb-2">
              CNIC
            </label>

            <div className="flex gap-1.5 flex-wrap">
              {cnic.map((digit, index) => (
                <input
                  key={index}
                  id={`cnic-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) =>
                    handleCnicChange(index, e.target.value)
                  }
                  onKeyDown={(e) =>
                    handleCnicKeyDown(index, e)
                  }
                  className="w-8 h-10 text-center rounded-md bg-ink border border-gray-700 focus:border-gold outline-none"
                />
              ))}
            </div>
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block mb-2">
              Profile Picture
            </label>

            <div className="flex items-center gap-4">

              {/* Preview */}
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Profile Preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gold"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-ink border border-gray-700 flex items-center justify-center text-gray-500 text-xs text-center">
                  No Image
                </div>
              )}

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImage}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-gold text-black font-semibold hover:opacity-90"
                >
                  Choose Picture
                </button>

                <p className="text-xs text-gray-500 mt-2">
                  JPG, PNG or other image • Max 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-lg bg-ink border border-gray-700 focus:border-gold outline-none"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm password"
              className="w-full px-4 py-3 rounded-lg bg-ink border border-gray-700 focus:border-gold outline-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Signup Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gold text-black font-bold hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-gold hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Signup;