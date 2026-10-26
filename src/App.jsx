import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import CarDetails from "./pages/CarDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Admin from "./pages/Admin";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AddCar from "./pages/AddCar";
import ManageCars from "./pages/ManageCars";
import Bookings from "./pages/Bookings";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />

      <Navbar />

      <main className="flex-1">
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/cars/:category" element={<Cars />} />
          <Route
            path="/cars/:category/:slug"
            element={<CarDetails />}
          />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Customer Protected Route */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<Admin />} />

            <Route
              path="/admin/add-car"
              element={<AddCar />}
            />

            <Route
              path="/admin/manage-cars"
              element={<ManageCars />}
            />

            <Route
              path="/admin/bookings"
              element={<Bookings />}
            />
          </Route>

        </Routes>
      </main>

      <Footer />
    </div>
  );
}