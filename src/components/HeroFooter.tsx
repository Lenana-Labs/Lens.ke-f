import Link from "next/link";

export default function HeroFooter() {
  return (
    <footer className="w-full bg-[color:var(--color-footer-bg)] rounded-t-[24px] mt-8 pt-12 pb-4 flex flex-col text-white">
      
      {/* Upper CTA Block */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight leading-tight">
          Showcase Kenya's Beauty to the World.
        </h2>
        <p className="text-base md:text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          Are you a photographer? Share your visual stories on Lens.ke and reach a global audience.
        </p>
        <button className="px-8 py-3 bg-[color:var(--color-primary)] hover:bg-[#1c5d3f] text-white rounded-lg font-semibold transition-colors">
          Start Contributing
        </button>
      </div>

      {/* Lower Directory Columns */}
      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        
        {/* Column 1: About */}
        <div>
          <h3 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">About Lens.ke</h3>
          <p className="text-gray-400 leading-relaxed text-sm">
            We are Kenya's premium visual archive, curating the finest stock photography of our landscapes, wildlife, culture, and urban life. Built for storytellers, by storytellers.
          </p>
        </div>

        {/* Column 2: Browse */}
        <div>
          <h3 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">Browse</h3>
          <ul className="space-y-4 text-sm">
            <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Wildlife</Link></li>
            <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Landscapes</Link></li>
            <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Culture</Link></li>
            <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Street</Link></li>
          </ul>
        </div>

        {/* Column 3: Information */}
        <div>
          <h3 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">Information</h3>
          <ul className="space-y-4 text-sm">
            <li><Link href="/about?tab=mission" className="text-gray-400 hover:text-white transition-colors">Our Mission</Link></li>
            <li><Link href="/about?tab=license" className="text-gray-400 hover:text-white transition-colors">License & Usage</Link></li>
            <li><Link href="/about?tab=faq" className="text-gray-400 hover:text-white transition-colors">FAQs</Link></li>
            <li><Link href="mailto:hello@wild.ke" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Column 4: Connect */}
        <div>
          <h3 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">Connect</h3>
          <form className="mb-6">
            <div className="flex">
              <input 
                type="email" 
                placeholder="Join our newsletter" 
                className="w-full bg-[#2a2a2a] border border-[#333] rounded-l-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-gray-500"
              />
              <button 
                type="button" 
                className="bg-[color:var(--color-primary)] hover:bg-[#1c5d3f] text-white px-4 rounded-r-lg transition-colors flex items-center justify-center"
                title="Subscribe"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </form>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">X (formerly Twitter)</span>
              <svg className="h-4 w-4 mt-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">Instagram</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">Facebook</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19.812 5.418c.881 0 1.596.732 1.596 1.635v11.895c0 .902-.715 1.636-1.596 1.636H4.187C3.307 20.584 2.592 19.851 2.592 18.948V7.053c0-.903.715-1.635 1.595-1.635h15.625zM10.954 17.585v-6.33h-2.106v6.33h2.106zm-1.053-7.194c.732 0 1.182-.486 1.182-1.092-.014-.62-.45-1.09-1.168-1.09-.718 0-1.182.47-1.182 1.09 0 .606.45 1.092 1.154 1.092h.014zm8.397 7.194v-3.71c0-1.987-1.061-2.91-2.473-2.91-1.141 0-1.65.627-1.932 1.066v-.915h-2.106c.028.595 0 6.469 0 6.469h2.106v-3.614c0-.193.014-.386.07-.524.155-.386.507-.785 1.099-.785.774 0 1.084.59 1.084 1.455v3.524h2.152z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="w-full border-t border-white/10 pt-8 mt-4">
        <p className="text-center text-sm text-gray-500">
          © 2026 Lens.ke. All rights reserved.
        </p>
      </div>

    </footer>
  );
}
