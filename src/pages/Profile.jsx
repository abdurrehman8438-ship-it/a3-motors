import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, userData, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-ink text-cream flex items-center justify-center">
        <p className="text-gold">Loading profile...</p>
      </div>
    );
  }

  // If user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-ink text-cream flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Please login first
          </h1>

          <Link
            to="/login"
            className="inline-block bg-gold text-ink font-semibold px-6 py-3 rounded-lg"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-ink text-cream px-4 py-12">

      <div className="max-w-2xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gold">
            My Profile
          </h1>

          <p className="text-gray-400 mt-2">
            Manage your A3 Motors account
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-panel rounded-2xl p-6 md:p-8 border border-line">

          {/* Profile Image */}
          <div className="flex flex-col items-center mb-8">

            {userData?.profileImage ? (
              <img
                src={userData.profileImage}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-gold"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gold text-ink flex items-center justify-center text-4xl font-bold">
                {userData?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}

            <h2 className="text-2xl font-bold mt-4">
              {userData?.name || "User"}
            </h2>

            <p className="text-gray-400">
              {userData?.email || user.email}
            </p>

          </div>

          {/* User Information */}
          <div className="space-y-4">

            {/* Name */}
            <div className="bg-ink rounded-lg p-4">
              <p className="text-gray-500 text-sm">
                Full Name
              </p>

              <p className="text-cream mt-1">
                {userData?.name || "Not available"}
              </p>
            </div>

            {/* Email */}
            <div className="bg-ink rounded-lg p-4">
              <p className="text-gray-500 text-sm">
                Email
              </p>

              <p className="text-cream mt-1 break-all">
                {userData?.email || user.email}
              </p>
            </div>

            {/* CNIC */}
            <div className="bg-ink rounded-lg p-4">
              <p className="text-gray-500 text-sm">
                CNIC
              </p>

              <p className="text-cream mt-1">
                {userData?.cnic || "Not available"}
              </p>
            </div>

            {/* Role */}
            <div className="bg-ink rounded-lg p-4">
              <p className="text-gray-500 text-sm">
                Account Type
              </p>

              <p className="text-gold mt-1 capitalize">
                {userData?.role || "user"}
              </p>
            </div>

          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">

            <Link
              to="/"
              className="flex-1 text-center border border-gold text-gold font-semibold px-5 py-3 rounded-lg hover:bg-gold hover:text-ink transition-colors"
            >
              Back to Home
            </Link>

            <button
              onClick={handleLogout}
              className="flex-1 bg-gold text-ink font-semibold px-5 py-3 rounded-lg hover:bg-gold-dim transition-colors"
            >
              Logout
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;