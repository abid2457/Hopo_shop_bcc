import { Link } from "react-router-dom";
import { useState } from "react";
import { MobileFrame, StatusBar, Logo } from "@/components/app/MobileShell";
const slides = [
  {
    title: "Curated edits, every season",
    desc: "Boutique collections handpicked by our in-house stylists.",
    image: "/images/lehenga_ruby_rose_embroidered.png",
  },
  {
    title: "Brands you trust",
    desc: "From Sabyasachi to Tarun Tahiliani — only authentic, only the best.",
    image: "/images/craftsmanship_detail.png",
  },
  {
    title: "Easy returns, anywhere in India",
    desc: "Free 15-day returns and try-and-buy on selected pieces.",
    image: "/images/maroon_potli.png",
  },
];
export function Onboarding() {
  const [i, setI] = useState(0);
  const s = slides[i];
  const last = i === slides.length - 1;
  return (
    <MobileFrame>
      <StatusBar />
      <div className="flex items-center justify-between px-5 pt-3 pb-1">
        <Logo className="w-[105px] sm:w-[120px] max-w-[130px] h-auto" to="/home" />
        <Link to="/home" className="text-xs text-muted-foreground hover:text-primary font-medium">
          Skip
        </Link>
      </div>
      <div className="px-5 mt-4">
        <div className="aspect-[4/5] rounded-3xl overflow-hidden">
          <img src={s.image} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="mt-8 text-center px-2">
          <h1 className="font-display text-3xl text-foreground">{s.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{s.desc}</p>
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-primary" : "w-1.5 bg-border"}`}
            />
          ))}
        </div>
        <div className="mt-6 flex items-center gap-3">
          {i > 0 && (
            <button onClick={() => setI(i - 1)} className="flex-1 rounded-full border py-3 text-sm">
              Back
            </button>
          )}
          {!last ? (
            <button
              onClick={() => setI(i + 1)}
              className="flex-1 rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold"
            >
              Next
            </button>
          ) : (
            <Link
              to="/home"
              className="flex-1 rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold text-center"
            >
              Get started
            </Link>
          )}
        </div>
      </div>
    </MobileFrame>
  );
}
export default Onboarding;
