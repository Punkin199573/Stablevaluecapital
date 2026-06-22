import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="container py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand Section */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center space-x-4 mb-6 group">
              <div className="relative h-16 w-16 flex-shrink-0 bg-white rounded-xl p-2 shadow-lg group-hover:shadow-xl transition-shadow">
                <Image
                  src="/logo.png"
                  alt="Stable Value Capital"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-heading font-bold text-xl text-white block">
                  Stable Value
                </span>
                <span className="text-slate-400 text-sm font-medium tracking-wide">
                  Capital
                </span>
              </div>
            </Link>
            <p className="text-slate-400 leading-relaxed mb-6 max-w-sm">
              Strategic capital allocation and investment advisory serving high-net-worth individuals and institutional
              clients globally.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-500">USA</p>
                  <a href="tel:+14042958687" className="text-white font-medium hover:text-blue-400 transition-colors">
                    +1 404 295 8687
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-500">UK (WhatsApp)</p>
                  <a href="tel:+447342300335" className="text-white font-medium hover:text-green-400 transition-colors">
                    +44 7342 300335
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email Us</p>
                  <a href="mailto:info@stablevaluecapital.com" className="text-white font-medium hover:text-blue-400 transition-colors">
                    info@stablevaluecapital.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="lg:col-span-2">
            <h3 className="font-heading font-bold text-white mb-6">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/wealth-management" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Wealth Management
                </Link>
              </li>
              <li>
                <Link href="/wealth-management/private-placements" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Private Placements
                </Link>
              </li>
              <li>
                <Link href="/wealth-management/lending-program" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Securities Lending
                </Link>
              </li>
              <li>
                <Link href="/project-funding" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Project Funding
                </Link>
              </li>
              <li>
                <Link href="/project-funding/collateralized-loans" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Collateralized Loans
                </Link>
              </li>
              <li>
                <Link href="/loans" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Business Loans
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h3 className="font-heading font-bold text-white mb-6">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/testimonials" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Client Stories
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/apply" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Applications
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Legal
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Global Offices */}
          <div className="lg:col-span-4">
            <h3 className="font-heading font-bold text-white mb-6">Global Offices</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <p className="font-semibold text-white mb-1">United States</p>
                <p className="text-slate-400 text-sm mb-2">Hamburg, New York</p>
                <p className="text-blue-400 text-sm font-medium">+1 404 295 8687</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <p className="font-semibold text-white mb-1">United Kingdom</p>
                <p className="text-slate-400 text-sm mb-2">London, UK</p>
                <p className="text-green-400 text-sm font-medium">+44 7342 300335</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 sm:col-span-2">
                <p className="font-semibold text-white mb-1">Banking Partner</p>
                <p className="text-slate-400 text-sm">HSBC Bank, London, UK</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 text-sm text-slate-400">
            <div>
              <p className="font-semibold text-white mb-2">Legal & Compliance</p>
              <p>Solicitor: Senior Partner</p>
              <p>Anti-Money Laundering Compliance (UK MLR 2017)</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">Investment Disclaimer</p>
              <p className="leading-relaxed">
                Investment opportunities intended solely for Accredited Investors, Institutional, and Sophisticated
                Investors. All investments carry risk of loss.
              </p>
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <p className="font-semibold text-white mb-2">Certifications</p>
              <p>SEC Registered Investment Advisor</p>
              <p>FCA Regulated Entity</p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2024 Stable Value Capital. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
