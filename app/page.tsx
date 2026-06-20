"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, TrendingUp, Shield, Globe, Award, CircleCheck as CheckCircle, Quote, Star } from 'lucide-react'

const testimonials = [
  {
    quote: "Stable Value Capital has been instrumental in growing our family wealth across generations. Their sophisticated approach to portfolio management delivered consistent 18% annual returns.",
    author: "Jonathan Mitchell",
    title: "Family Office Principal",
    company: "Mitchell Holdings",
    location: "New York, USA",
    rating: 5,
  },
  {
    quote: "The private placement opportunities provided access to investments we couldn't find elsewhere. Their due diligence and risk management are exceptional.",
    author: "Dr. Sarah Chen",
    title: "Chief Investment Officer",
    company: "Pioneer Healthcare Ventures",
    location: "Singapore",
    rating: 5,
  },
  {
    quote: "Project funding was seamless. They structured a $45M facility for our renewable energy initiative with terms that traditional banks couldn't match.",
    author: "Marcus Rodriguez",
    title: "CEO & Founder",
    company: "SolarGrid International",
    location: "Dubai, UAE",
    rating: 5,
  },
  {
    quote: "Their securities lending program generates steady passive income while we retain full ownership of our assets. Truly institutional-grade service.",
    author: "Hans Mueller",
    title: "Managing Director",
    company: "Alpine Asset Management",
    location: "Zurich, Switzerland",
    rating: 5,
  },
  {
    quote: "The credit enhancement strategies transformed our borrowing capacity. We secured financing at rates we never thought possible for our expansion.",
    author: "Priya Sharma",
    title: "CFO",
    company: "TechBridge Solutions",
    location: "Mumbai, India",
    rating: 5,
  },
]

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % testimonials.length)
        setIsTransitioning(false)
      }, 300)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <Navigation currentPage="/" />

      {/* Hero Section */}
      <section className="flex-1 pt-8 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[500px]">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/5 rounded-full border border-slate-200">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-semibold text-slate-700 tracking-wide">
                  Strategic Capital Management
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                Premium Wealth
                <span className="block mt-2 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 bg-clip-text text-transparent">
                  Management
                </span>
                <span className="block text-2xl sm:text-3xl lg:text-4xl font-medium text-slate-500 mt-3">
                  for Discerning Investors
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl">
                Sophisticated investment solutions and strategic capital allocation for high-net-worth individuals
                and institutional investors across global markets.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-lg shadow-slate-900/20 transition-all hover:shadow-xl hover:shadow-slate-900/30"
                  >
                    Start Investing
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 rounded-lg"
                >
                  Explore Services
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm text-slate-600">SEC Registered</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-slate-600">25+ Countries</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  <span className="text-sm text-slate-600">20+ Years</span>
                </div>
              </div>
            </div>

            {/* Right Content - Logo & Testimonials Carousel */}
            <div className="hidden lg:flex flex-col justify-center items-center">
              <div className="relative w-full max-w-lg">
                {/* Main Card */}
                <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-100 overflow-hidden">
                  {/* Gradient Header */}
                  <div className="h-32 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L2c+PC9zdmc+')] opacity-30" />

                    {/* Logo */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-40 h-40 bg-white rounded-2xl shadow-xl flex items-center justify-center transform -translate-y-12">
                        <Image
                          src="/logo.png"
                          alt="Stable Value Capital"
                          fill
                          className="object-contain p-4"
                          priority
                        />
                      </div>
                    </div>
                  </div>

                  {/* Testimonial Content */}
                  <div className="pt-24 pb-8 px-8">
                    <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'}`}>
                      <Quote className="h-10 w-10 text-slate-200 mb-4" />

                      <p className="text-slate-700 leading-relaxed text-lg mb-6 font-serif italic">
                        "{testimonials[currentSlide].quote}"
                      </p>

                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonials[currentSlide].rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>

                      <div className="border-t border-slate-100 pt-4">
                        <p className="font-bold text-slate-900 text-lg">{testimonials[currentSlide].author}</p>
                        <p className="text-slate-600">{testimonials[currentSlide].title}</p>
                        <p className="text-slate-500 text-sm">{testimonials[currentSlide].company} • {testimonials[currentSlide].location}</p>
                      </div>
                    </div>

                    {/* Carousel Indicators */}
                    <div className="flex justify-center gap-2 mt-6">
                      {testimonials.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setIsTransitioning(true)
                            setTimeout(() => {
                              setCurrentSlide(index)
                              setIsTransitioning(false)
                            }, 300)
                          }}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentSlide
                              ? 'w-8 bg-slate-900'
                              : 'w-2 bg-slate-300 hover:bg-slate-400'
                          }`}
                          aria-label={`Go to testimonial ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 h-24 w-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl rotate-12 opacity-20" />
                <div className="absolute -bottom-4 -left-4 h-20 w-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl -rotate-12 opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-white/10 rounded-full text-sm font-semibold text-blue-300 mb-6">
              Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight">
              Excellence in Wealth Management
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Our comprehensive approach combines institutional expertise, innovative strategies, and personalized service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Institutional Trust",
                description: "Trusted by institutions and HNWI clients worldwide with robust compliance and risk management frameworks.",
                stat: "500+",
                statLabel: "Client Relationships"
              },
              {
                icon: TrendingUp,
                title: "Strategic Returns",
                description: "Data-driven investment strategies focused on sustainable growth and capital preservation.",
                stat: "$2B+",
                statLabel: "Assets Managed"
              },
              {
                icon: Globe,
                title: "Global Reach",
                description: "Access to international markets and opportunities with deep local market expertise.",
                stat: "25+",
                statLabel: "Countries Served"
              },
              {
                icon: Award,
                title: "Expert Advisory",
                description: "Seasoned portfolio managers and financial strategists with decades of combined experience.",
                stat: "20+",
                statLabel: "Years of Excellence"
              },
              {
                icon: CheckCircle,
                title: "Transparent Process",
                description: "Clear communication and detailed reporting on all investments and portfolio performance.",
                stat: "98%",
                statLabel: "Client Retention"
              },
              {
                icon: TrendingUp,
                title: "Wealth Optimization",
                description: "Comprehensive tax planning and estate management strategies tailored to your goals.",
                stat: "18%",
                statLabel: "Avg. Annual Return"
              }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group backdrop-blur-sm"
                >
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <span className="text-3xl font-bold text-blue-400">{feature.stat}</span>
                      <span className="text-slate-500 text-sm ml-2">{feature.statLabel}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-slate-100 rounded-full text-sm font-semibold text-slate-700 mb-6">
              Our Services
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              Comprehensive Financial Solutions
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Tailored to your investment objectives, risk profile, and long-term financial goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Wealth Management",
                description: "Personalized portfolio management for high-net-worth individuals seeking comprehensive asset management and strategic growth.",
                features: ["Portfolio Optimization", "Risk Management", "Estate Planning"],
                cta: "/wealth-management"
              },
              {
                title: "Strategic Investments",
                description: "Access to curated investment opportunities across multiple asset classes, private placements, and global geographies.",
                features: ["Private Placements", "Alternative Assets", "Global Markets"],
                cta: "/wealth-management/private-placements"
              },
              {
                title: "Capital Allocation",
                description: "Expert guidance on optimal capital deployment across your portfolio and emerging market opportunities.",
                features: ["Project Funding", "M&A Financing", "Growth Capital"],
                cta: "/project-funding"
              },
              {
                title: "Financial Advisory",
                description: "Strategic consulting on wealth preservation, tax optimization, and long-term financial planning strategies.",
                features: ["Tax Planning", "Risk Mitigation", "Exit Strategies"],
                cta: "/contact"
              }
            ].map((service, index) => (
              <Card
                key={index}
                className="group border-slate-200 hover:border-slate-400 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50"
              >
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-6">{service.description}</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={service.cta}
                    className="inline-flex items-center text-slate-900 font-semibold hover:text-blue-600 transition-colors group-hover:gap-3 gap-2"
                  >
                    Learn More
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight">
              Proven Track Record
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Decades of consistent performance building wealth for our clients worldwide.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "$2B+", label: "Assets Under Management", icon: TrendingUp },
              { value: "500+", label: "Client Relationships", icon: Award },
              { value: "20+", label: "Years of Excellence", icon: Shield },
              { value: "25+", label: "Countries Served", icon: Globe }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 mb-4 group-hover:bg-white/20 transition-colors">
                  <stat.icon className="h-8 w-8 text-blue-400" />
                </div>
                <div className="text-4xl sm:text-5xl font-bold mb-2 tracking-tight">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 sm:p-16 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight">
                Ready to Grow Your Wealth?
              </h2>
              <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
                Schedule a consultation with our expert advisors to discuss your financial
                goals and discover tailored investment strategies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="h-14 px-10 bg-white text-slate-900 hover:bg-slate-100 shadow-lg rounded-lg"
                  >
                    Schedule a Consultation
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-10 border-2 border-white/30 text-white hover:bg-white/10 rounded-lg"
                >
                  Call: +1 404 295 8687
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
