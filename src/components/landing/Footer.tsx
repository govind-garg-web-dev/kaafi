import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#7c5cfc] to-[#22d3ee] flex items-center justify-center">
            <span className="text-white font-bold text-xs" style={{ fontFamily: "var(--font-playfair)" }}>K</span>
          </div>
          <span
            className="text-white font-bold"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Kaafi
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          {[
            { label: "Try demo", href: "/demo" },
            { label: "How it works", href: "#how-it-works" },
            { label: "Pricing", href: "#pricing" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[#4a5568] hover:text-white text-sm transition-colors"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Credit */}
        <p
          className="text-[#2d2d4a] text-sm"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Built with 💜 for non-coders
        </p>
      </div>
    </footer>
  );
}
