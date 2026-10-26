import { Link } from "react-router-dom";
import { Gauge, AtSign, Globe, MessageCircle, MapPin, Mail, Phone } from "lucide-react";
import { categories } from "../data/cars";

export default function Footer() {
  return (
    <footer className="bg-panel border-t border-line">
      <div className="container-px py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Gauge className="text-gold" size={24} />
            <span className="font-display text-lg tracking-wide">
              A3 <span className="text-gold">MOTORS</span>
            </span>
          </div>
          <p className="text-sm text-mute leading-relaxed max-w-xs">
            Car rental and showroom for your dream journeys. Quality cars, trusted
            service, customer first.
          </p>
          <div className="flex gap-3 mt-5">
            {[AtSign, Globe, MessageCircle].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-cream/80 hover:text-gold hover:border-gold transition-colors focus-ring"
                aria-label="Social link"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm tracking-wide text-cream mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-sm text-mute">
            <li><Link to="/" className="hover:text-gold transition-colors">Home</Link></li>
            <li><Link to="/about" className="hover:text-gold transition-colors">About</Link></li>
            <li><Link to="/cars" className="hover:text-gold transition-colors">Cars</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm tracking-wide text-cream mb-4">Car Categories</h4>
          <ul className="space-y-2.5 text-sm text-mute">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link to={`/cars/${c.slug}`} className="hover:text-gold transition-colors">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm tracking-wide text-cream mb-4">Contact</h4>
          <ul className="space-y-3 text-sm text-mute">
            <li className="flex items-center gap-2"><Phone size={15} className="text-gold shrink-0" /> +92 305 1431892</li>
            <li className="flex items-center gap-2"><Mail size={15} className="text-gold shrink-0" /> a3motors19@gmail.com</li>
            <li className="flex items-center gap-2"><MapPin size={15} className="text-gold shrink-0" /> Faisalabad, Pakistan</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line container-px py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-mute">
        <p>© 2026 A3 Motors. All rights reserved.</p>
        <div className="flex gap-5">
          <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gold transition-colors">Terms & Conditions</a>
        </div>
      </div>
    </footer>
  );
}
