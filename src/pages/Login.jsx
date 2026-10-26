import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

import auth from "../firebase/auth";
import db from "../firebase/firestore";

const Login = () => {
  const navigate = useNavigate();

  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    const value = loginValue.trim();

    if (!value) {
      setError("Please enter your email or CNIC.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      let email = value;

      // Check if user entered CNIC
      const isCNIC = /^\d{13}$/.test(value);

      if (isCNIC) {
        // Search Firestore for matching CNIC
        const usersRef = collection(db, "users");

        const q = query(
          usersRef,
          where("cnic", "==", value)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError("No account found with this CNIC.");
          setLoading(false);
          return;
        }

        // Get user's email from Firestore
        const userData = querySnapshot.docs[0].data();

        email = userData.email;
      }

      // Login with Firebase Authentication
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Login successful
      navigate("/");
    } catch (err) {
      console.error(err);

      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        setError("Incorrect email/CNIC or password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email or CNIC.");
      } else {
        setError(err.message || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-cream flex items-center justify-center px-4 py-12">

      <div className="w-full max-w-md bg-panel rounded-2xl p-6 md:p-8 shadow-xl">

        {/* Heading */}
        <div className="text-center mb-8">

          <h1 className="text-3xl font-bold text-gold">
            Welcome Back
          </h1>

          <p className="text-gray-400 mt-2">
            Login to your A3 Motors account
          </p>

        </div>

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          {/* Email / CNIC */}
          <div>

            <label className="block mb-2">
              Email or CNIC
            </label>

            <input
              type="text"
              value={loginValue}
              onChange={(e) =>
                setLoginValue(e.target.value)
              }
              placeholder="Enter email or 13-digit CNIC"
              className="w-full px-4 py-3 rounded-lg bg-ink border border-gray-700 focus:border-gold outline-none"
            />

          </div>

          {/* Password */}
          <div>

            <label className="block mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg bg-ink border border-gray-700 focus:border-gold outline-none"
            />

          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gold text-black font-bold hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* Signup Link */}
        <p className="text-center text-gray-400 mt-6">

          Don't have an account?{" "}

          <Link
            to="/signup"
            className="text-gold hover:underline"
          >
            Create Account
          </Link>

        </p>

      </div>

    </div>
  );
};

export default Login;