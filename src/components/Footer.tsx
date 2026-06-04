import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          
          {/* Brand & Copyright */}
          <div className="text-center md:text-left">
            <Link href="/" className="text-2xl font-bold font-playfair tracking-tight text-[color:var(--color-primary)]">
              Lens.ke
            </Link>
            <p className="text-gray-500 text-sm mt-2">
              © {new Date().getFullYear()} Lens.ke. The premium visual archive of Kenya.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center space-x-6 text-sm font-medium text-gray-600">
            <Link href="/about" className="hover:text-[color:var(--color-primary)] transition-colors">
              Our Mission
            </Link>
            <Link href="/about?tab=license" className="hover:text-[color:var(--color-primary)] transition-colors">
              License & Usage
            </Link>
            <Link href="/about?tab=faq" className="hover:text-[color:var(--color-primary)] transition-colors">
              FAQs
            </Link>
            <Link href="mailto:hello@lens.ke" className="hover:text-[color:var(--color-primary)] transition-colors">
              Contact
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
