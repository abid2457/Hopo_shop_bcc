import { Link } from "react-router-dom";
import { MobileFrame, AppHeader } from "@/components/app/MobileShell";
import { Leaf, Scissors, Heart, MapPin } from "lucide-react";
const sections = [
  {
    icon: Heart,
    title: "Our Story",
    body: "HOPO SHOP began as a quiet collaboration between three friends — a textile designer, a couturier, and a curator — united by a love for India's craft. We set out to build a wardrobe that feels considered, never fast.",
    image: "/images/lehenga_crimson_royal_bridal.png",
  },
  {
    icon: Scissors,
    title: "Craftsmanship",
    body: "Every silhouette is finished by hand. Our wedding blouses and handcrafted creations pass through master artisans before they reach you. Embroideries are aari, zardozi, and resham — never machine‑mimicked.",
    image: "/images/craftsmanship_detail.png",
  },
  {
    icon: Leaf,
    title: "Sustainable Fabrics",
    body: "We use natural fibres — mulberry silk, organic cotton, linen, and ahimsa silk — sourced from women‑led farms across Karnataka, Assam, and Andhra Pradesh. Dyes are azo‑free and water‑saving.",
    image: "/images/festive_wear_teal_velvet_shawl.png",
  },
  {
    icon: MapPin,
    title: "Made in India",
    body: "From the loom to the label, every piece in this app is made in India. We work directly with weavers' clusters and pay above the minimum wage — because true luxury starts with how it is made.",
    image: "/images/bridal_blouse_crimson_peacock.png",
  },
];
export function AboutBrand() {
  return (
    <MobileFrame>
      <AppHeader back />

      <div className="px-6 pt-2">
        <p className="text-[10px] tracking-[0.35em] uppercase text-gold">Maison HOPO SHOP</p>
        <h1 className="font-display text-4xl mt-2 leading-[1.05]">
          Quiet luxury,
          <br />
          honestly Indian.
        </h1>
        <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
          A boutique fashion house bringing India's most considered craftsmanship to a new
          generation of women.
        </p>
      </div>

      <div className="mt-8 space-y-10 pb-10">
        {sections.map((s, i) => (
          <section key={s.title}>
            <div className="aspect-[5/3]">
              <img src={s.image} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="px-6 mt-5">
              <div className="flex items-center gap-2 text-gold">
                <s.icon className="h-4 w-4" />
                <p className="text-[10px] tracking-[0.3em] uppercase">Chapter 0{i + 1}</p>
              </div>
              <h2 className="font-display text-2xl mt-1">{s.title}</h2>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{s.body}</p>
            </div>
          </section>
        ))}
      </div>

      <div className="px-6 pb-10">
        <blockquote className="font-display text-2xl leading-tight italic border-l-2 border-gold pl-4">
          "When you wear something made by hand, you wear a story."
        </blockquote>
        <p className="text-xs text-muted-foreground mt-3">— Anjali Mehta, Creative Director</p>
        <Link
          to="/home"
          className="mt-8 block text-center rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold"
        >
          Shop the maison
        </Link>
      </div>
    </MobileFrame>
  );
}
export default AboutBrand;
