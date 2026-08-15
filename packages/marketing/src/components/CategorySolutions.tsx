import React from "react";
import Link from "next/link";
import { Store, Cake, Sparkles, ArrowRight, MapPin } from "lucide-react";

export default function CategorySolutions() {
  const categories = [
    {
      slug: "clothing-boutiques-kerala",
      title: "Clothing Boutiques",
      location: "Kerala & South India",
      description: "Convert Instagram DM threads into automated garment catalog checkouts with regional courier pickups.",
      icon: <Store className="w-6 h-6 text-blue-600" />,
      tag: "Boutique Fashion",
    },
    {
      slug: "home-bakers-kochi",
      title: "Home Bakers & Artisans",
      location: "Kochi & Urban Centers",
      description: "Accept custom orders, advance UPI payments, and coordinate local door-to-door delivery.",
      icon: <Cake className="w-6 h-6 text-blue-600" />,
      tag: "Custom Orders",
    },
    {
      slug: "saree-designers-thrissur",
      title: "Regional D2C Brands",
      location: "Thrissur & Regional Hubs",
      description: "Scale high-ticket saree and handicraft sales with zero transaction fees and automated COD verification.",
      icon: <Sparkles className="w-6 h-6 text-blue-600" />,
      tag: "High Margin D2C",
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tailored Solutions</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Engineered for Regional SMB Categories
          </h2>
          <p className="text-base text-slate-500 font-medium leading-relaxed">
            Specialized storefront workflows built specifically for Indian Instagram sellers, local boutiques, and regional brand categories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((item) => (
            <Link
              key={item.slug}
              href={`/discover/${item.slug}`}
              className="group p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    {item.icon}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {item.location}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600">{item.tag}</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>View Regional Solution</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
