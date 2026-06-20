"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"

const Menu = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

interface NavigationProps {
  currentPage?: string
}

export default function Navigation({ currentPage }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigationItems = [
    { href: "/", label: "Home" },
    { href: "/wealth-management", label: "Wealth Management" },
    { href: "/project-funding", label: "Project Funding" },
    { href: "/loans", label: "Business Loans" },
    { href: "/testimonials", label: "Testimonials" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm">
      <div className="container flex h-24 items-center justify-between">
        <Link href="/" className="flex items-center space-x-4 group">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-1.5 shadow-sm group-hover:shadow-md transition-shadow">
            <Image
              src="/logo.png"
              alt="Stable Value Capital"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <span className="font-heading font-bold text-xl lg:text-2xl text-slate-900 block leading-tight">
              Stable Value
            </span>
            <span className="text-sm lg:text-base text-slate-500 font-medium tracking-wide">
              Capital
            </span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center space-x-1">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === item.href
                  ? "text-slate-900 bg-slate-100"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <a
            href="tel:+14042958687"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            +1 404 295 8687
          </a>
          <Link href="/contact">
            <Button
              size="lg"
              className="h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 rounded-lg"
            >
              Get Started
            </Button>
          </Link>
        </div>

        <button
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6 text-slate-700" /> : <Menu className="h-6 w-6 text-slate-700" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl">
          <div className="container py-6 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                  currentPage === item.href
                    ? "text-slate-900 bg-slate-100"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-200">
              <a
                href="tel:+14042958687"
                className="block px-4 py-2 text-sm text-slate-600"
              >
                Call: +1 404 295 8687
              </a>
              <Link href="/contact" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
