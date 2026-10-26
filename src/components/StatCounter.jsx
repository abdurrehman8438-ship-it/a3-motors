import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

export default function StatCounter({ value, suffix = "", label }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-3xl md:text-4xl text-gold">
        {count}
        {suffix}
      </p>
      <p className="text-xs md:text-sm text-mute mt-1">{label}</p>
    </div>
  );
}
