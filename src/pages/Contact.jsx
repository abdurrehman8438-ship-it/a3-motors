import { useState } from "react";
import {
  Phone, Mail, MessageCircle, AtSign, Globe, MapPin, Clock,
  ChevronDown, PhoneCall,
} from "lucide-react";
import { genericImage } from "../data/media";
import { categories } from "../data/cars";

const faqs = [
  { q: "What documents are required for rental?", a: "A valid driving license and a national ID or passport are required at the time of pickup." },
  { q: "Is there a mileage limit?", a: "Most rentals include a fair-use daily mileage allowance; extra mileage is billed at a standard rate." },
  { q: "Can I cancel my booking?", a: "Yes, bookings can be cancelled up to 24 hours before pickup for a full refund of the deposit." },
  { q: "What payment methods do you accept?", a: "We accept cash, major debit/credit cards, and bank transfers." },
];

export default function Contact() {
  const [openFaq, setOpenFaq] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", category: "", rentalDate: "", returnDate: "", message: "",
  });

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={genericImage("A3 Motors")}
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />
        </div>
        <div className="relative container-px py-16">
          <h1 className="font-display text-3xl md:text-4xl text-cream">Get In Touch</h1>
          <p className="text-mute text-sm mt-2">We're here to help. Reach out to us anytime.</p>
        </div>
      </section>

      <section className="container-px py-12 grid lg:grid-cols-2 gap-8">
        {/* Contact info */}
        <div className="bg-panel border border-line rounded-xl p-6 space-y-6">
          <h2 className="font-display text-lg text-cream">Contact Information</h2>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <Phone size={17} className="text-gold shrink-0" />
              <div>
                <p className="text-mute text-xs">Phone</p>
                <p className="text-cream">+92 305 1431892</p>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={17} className="text-gold shrink-0" />
              <div>
                <p className="text-mute text-xs">Email</p>
                <p className="text-cream">a3motors19@gmail.com</p>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <MessageCircle size={17} className="text-gold shrink-0" />
              <div>
                <p className="text-mute text-xs">WhatsApp</p>
                <p className="text-cream">+92 300 1234567</p>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <AtSign size={17} className="text-gold shrink-0" />
              <div>
                <p className="text-mute text-xs">Instagram</p>
                <p className="text-cream">@a3motors</p>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <Globe size={17} className="text-gold shrink-0" />
              <div>
                <p className="text-mute text-xs">Facebook</p>
                <p className="text-cream">A3 Motors</p>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <MapPin size={17} className="text-gold shrink-0" />
              <div>
                <p className="text-mute text-xs">Address</p>
                <p className="text-cream">A3 Motors, Faisalabad, Pakistan</p>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <Clock size={17} className="text-gold shrink-0" />
              <div>
                <p className="text-mute text-xs">Opening Hours</p>
                <p className="text-cream">Mon–Sun · 9:00 AM – 10:00 PM</p>
              </div>
            </li>
          </ul>

          <div className="aspect-video rounded-lg overflow-hidden border border-line">
  <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d168246.80643231326!2d73.08930095!3d31.423571499999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x392242a895a55ca9%3A0xdec58f88932671c6!2sFaisalabad%2C%20Pakistan!5e1!3m2!1sen!2s!4v1789138448667!5m2!1sen!2s"
    width="100%"
    height="100%"
    style={{ border: 0 }}
    allowFullScreen=""
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    title="A3 Motors Location"
  />
</div>
        </div>

        {/* Form */}
        <div className="bg-panel border border-line rounded-xl p-6">
          <h2 className="font-display text-lg text-cream mb-5">Send Us a Message</h2>
          {submitted ? (
            <div className="text-center py-14">
              <p className="text-gold font-display text-xl">Message sent</p>
              <p className="text-mute text-sm mt-2">
                Thanks for reaching out — our team will contact you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 text-sm text-cream/80 hover:text-gold underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Name *">
                  <input
                    required value={form.name} onChange={update("name")}
                    placeholder="Your name"
                    className="w-full bg-panel-2 border border-line rounded-md px-3 py-2.5 text-sm text-cream placeholder:text-mute focus-ring"
                  />
                </Field>
                <Field label="Email *">
                  <input
                    required type="email" value={form.email} onChange={update("email")}
                    placeholder="your@email.com"
                    className="w-full bg-panel-2 border border-line rounded-md px-3 py-2.5 text-sm text-cream placeholder:text-mute focus-ring"
                  />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Phone">
                  <input
                    value={form.phone} onChange={update("phone")}
                    placeholder="Your phone number"
                    className="w-full bg-panel-2 border border-line rounded-md px-3 py-2.5 text-sm text-cream placeholder:text-mute focus-ring"
                  />
                </Field>
                <Field label="Car / Category">
                  <select
                    value={form.category} onChange={update("category")}
                    className="w-full bg-panel-2 border border-line rounded-md px-3 py-2.5 text-sm text-cream focus-ring"
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Rental Date">
                  <input
                    type="date" value={form.rentalDate} onChange={update("rentalDate")}
                    className="w-full bg-panel-2 border border-line rounded-md px-3 py-2.5 text-sm text-cream focus-ring"
                  />
                </Field>
                <Field label="Return Date">
                  <input
                    type="date" value={form.returnDate} onChange={update("returnDate")}
                    className="w-full bg-panel-2 border border-line rounded-md px-3 py-2.5 text-sm text-cream focus-ring"
                  />
                </Field>
              </div>
              <Field label="Message *">
                <textarea
                  required rows={4} value={form.message} onChange={update("message")}
                  placeholder="Your message..."
                  className="w-full bg-panel-2 border border-line rounded-md px-3 py-2.5 text-sm text-cream placeholder:text-mute focus-ring resize-none"
                />
              </Field>
              <button
                type="submit"
                className="w-full bg-gold text-ink font-semibold text-sm py-3 rounded-md hover:bg-gold-dim transition-colors focus-ring"
              >
                Submit
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="container-px pb-12">
        <h2 className="font-display text-2xl text-cream mb-6">FAQ</h2>
        <div className="space-y-3 max-w-2xl">
          {faqs.map((f, i) => (
            <div key={f.q} className="bg-panel border border-line rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left text-sm text-cream focus-ring"
              >
                {f.q}
                <ChevronDown
                  size={16}
                  className={`text-gold shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                />
              </button>
              {openFaq === i && (
                <p className="px-4 pb-4 text-sm text-mute">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="container-px pb-16">
        <div className="bg-panel border border-line rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg text-cream">Need Immediate Assistance?</h3>
            <p className="text-mute text-sm mt-1">Call us now for quick support and booking.</p>
          </div>
          <a
            href="tel:+923001234567"
            className="flex items-center gap-2 bg-gold text-ink font-semibold text-sm px-6 py-3 rounded-md hover:bg-gold-dim transition-colors focus-ring whitespace-nowrap"
          >
            <PhoneCall size={16} /> Call Now
          </a>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs text-mute block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
