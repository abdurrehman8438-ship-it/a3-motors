import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Gauge } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/cars", label: "Cars" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { user, userData, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-ink/95 backdrop-blur border-b border-line"
          : "bg-transparent"
      }`}
    >
      <nav className="container-px flex items-center justify-between h-20">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0"
          onClick={() => setOpen(false)}
        >
          <Gauge
            className="text-gold"
            size={26}
            strokeWidth={2.5}
          />

          <span className="font-display text-xl tracking-wide text-cream">
            A3 <span className="text-gold">MOTORS</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `text-sm tracking-wide transition-colors focus-ring rounded ${
                    isActive
                      ? "text-gold"
                      : "text-cream/80 hover:text-gold"
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Desktop Authentication */}
        <div className="hidden md:flex items-center gap-3">

          {!user ? (
            <>
              {/* Login */}
              <Link
                to="/login"
                className="text-cream/80 hover:text-gold text-sm font-semibold transition-colors"
              >
                Login
              </Link>

              {/* Sign Up */}
              <Link
                to="/signup"
                className="border border-gold text-gold font-semibold text-sm px-4 py-2.5 rounded-md hover:bg-gold hover:text-ink transition-colors"
              >
                Sign Up
              </Link>

              {/* Book Now */}
              <Link
                to="/contact"
                className="bg-gold text-ink font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-gold-dim transition-colors focus-ring"
              >
                Book Now
              </Link>
            </>
          ) : (
            <>
              {/* Logged In User */}
              <div className="flex items-center gap-2">

                {userData?.profileImage ? (
                  <img
                    src={userData.profileImage}
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover border border-gold"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gold text-ink flex items-center justify-center font-bold">
                    {userData?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}

                <Link
                  to="/profile"
                  className="text-sm text-cream/80 hover:text-gold transition-colors"
                >
                  {userData?.name || "User"}
                </Link>

              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="bg-gold text-ink font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-gold-dim transition-colors focus-ring"
              >
                Logout
              </button>
            </>
          )}

        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-cream focus-ring rounded p-1"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>

      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-panel border-t border-line container-px py-5 flex flex-col gap-4">

          {/* Mobile Navigation Links */}
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `text-base ${
                  isActive ? "text-gold" : "text-cream/85"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}

          {/* Mobile Authentication */}
          {!user ? (
            <>
              {/* Login */}
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="text-cream/85 text-base"
              >
                Login
              </Link>

              {/* Sign Up */}
              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="text-gold text-base"
              >
                Sign Up
              </Link>

              {/* Book Now */}
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="bg-gold text-ink font-semibold text-sm px-5 py-3 rounded-md text-center"
              >
                Book Now
              </Link>
            </>
          ) : (
            <>
              {/* Mobile Logged In User */}
              <div className="flex items-center gap-3 py-2">

                {userData?.profileImage ? (
                  <img
                    src={userData.profileImage}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border border-gold"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gold text-ink flex items-center justify-center font-bold">
                    {userData?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}

                <div className="text-cream/85 text-base">
                  {userData?.name || "User"}
                </div>

              </div>

              {/* Logout */}
              <button
                onClick={async () => {
                  await logout();
                  setOpen(false);
                }}
                className="bg-gold text-ink font-semibold text-sm px-5 py-3 rounded-md text-center"
              >
                Logout
              </button>
            </>
          )}

        </div>
      )}
    </header>
  );
}