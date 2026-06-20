"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Phone, Mail, MapPin, Clock, Globe, Building2, Users, MessageSquare, Calendar, Loader as Loader2, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    country: "",
    serviceInterest: "",
    investmentAmount: "",
    message: "",
    preferredContact: "",
    urgency: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validateForm = () => {
    return !!(formData.firstName && formData.lastName && formData.email && formData.serviceInterest && formData.message)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setSubmitError("Please fill in all required fields.")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'contact',
          data: formData
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitSuccess(true)
      } else {
        setSubmitError(result.error || 'Failed to send message')
      }
    } catch (error) {
      setSubmitError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentPage="/contact" />
        <div className="container py-24">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-4xl font-heading font-black mb-4">Message Sent Successfully!</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Thank you for contacting Stable Value Capital. We have received your message and will respond within 24 hours.
                You will receive an email confirmation shortly at {formData.email}.
              </p>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Next steps:</strong>
                </p>
                <ul className="text-left max-w-md mx-auto space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Your inquiry has been routed to the appropriate specialist
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Initial response within 4 hours
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Personalized consultation scheduling available
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Button size="lg" className="bg-gradient-to-r from-primary to-secondary" onClick={() => window.location.href = '/'}>
                  Return to Home
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  const offices = [
    {
      city: "New York",
      country: "United States",
      address: "3123 CloverBank Road, Hamburg, NY 14075",
      phone: "+1 404 295 8687",
      email: "info@stablevaluecapital.com",
      timezone: "EST (UTC-5)",
      hours: "9:00 AM - 6:00 PM",
      icon: Building2,
    },
    {
      city: "London",
      country: "United Kingdom",
      address: "1 Canary Wharf, London E14 5AB",
      phone: "+1 404 295 8687",
      email: "info@stablevaluecapital.com",
      timezone: "GMT (UTC+0)",
      hours: "9:00 AM - 5:30 PM",
      icon: Building2,
    },
    {
      city: "Dubai",
      country: "United Arab Emirates",
      address: "Digital Park - Building A1, Silicon Oasis",
      phone: "+1 404 295 8687",
      email: "support@stablevaluecapital.com",
      timezone: "GST (UTC+4)",
      hours: "9:00 AM - 6:00 PM",
      icon: Building2,
    },
  ]

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Consultation",
      description: "Speak directly with our financial specialists",
      action: "Schedule Call",
      availability: "24/7 Global Support",
    },
    {
      icon: MessageSquare,
      title: "Secure Messaging",
      description: "Encrypted communication for sensitive discussions",
      action: "Send Message",
      availability: "Response within 2 hours",
    },
    {
      icon: Calendar,
      title: "Private Meeting",
      description: "Face-to-face consultation at our offices",
      action: "Book Meeting",
      availability: "Available worldwide",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Detailed inquiries and document sharing",
      action: "Send Email",
      availability: "Response within 4 hours",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation currentPage="/contact" />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="secondary" className="mb-6 px-6 py-2 text-sm font-semibold">
              Global Contact & Support
            </Badge>
            <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tight text-balance mb-8">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Connect with
              </span>
              <br />
              <span className="text-foreground">Our Experts</span>
            </h1>
            <p className="text-xl md:text-2xl leading-relaxed text-muted-foreground text-pretty mb-12">
              Reach out to our team of financial specialists for personalized consultation and premium service support
              across our global network of offices.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-heading font-black text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">Global Support</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-heading font-black text-secondary mb-2">2hrs</div>
                <div className="text-muted-foreground">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-heading font-black text-primary mb-2">25+</div>
                <div className="text-muted-foreground">Languages Supported</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-32">
        <div className="container">
          <motion.div
            className="mx-auto max-w-4xl text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-heading font-black tracking-tight mb-6">
              Contact <span className="text-primary">Methods</span>
            </h2>
            <p className="text-xl text-muted-foreground text-pretty">
              Choose your preferred method of communication for personalized financial consultation
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-4">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full p-6 text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 group">
                  <CardContent className="space-y-4">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                      <method.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-heading font-bold">{method.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{method.description}</p>
                    <div className="text-xs text-secondary font-semibold">{method.availability}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
                    >
                      {method.action}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Offices */}
      <section className="py-32 bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <motion.div
            className="mx-auto max-w-4xl text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-heading font-black tracking-tight mb-6">
              Global <span className="text-secondary">Offices</span>
            </h2>
            <p className="text-xl text-muted-foreground text-pretty">
              Connect with our teams across major financial centers worldwide
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {offices.map((office, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                        <office.icon className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-heading font-bold">{office.city}</CardTitle>
                        <CardDescription className="text-base">{office.country}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <span className="text-sm">{office.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">{office.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">{office.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{office.hours}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{office.timezone}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-32">
        <div className="container">
          <div className="grid gap-16 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-6xl font-heading font-black tracking-tight mb-8">
                Send Us a <span className="text-primary">Message</span>
              </h2>
              <p className="text-xl leading-relaxed text-muted-foreground mb-8">
                Complete the form below and our team will respond within 2 hours during business hours. For urgent
                matters, please call our 24/7 support line.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold">Dedicated Relationship Manager</h3>
                    <p className="text-sm text-muted-foreground">Assigned to high-value clients</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold">Multi-Language Support</h3>
                    <p className="text-sm text-muted-foreground">Available in 25+ languages</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold">Secure Communication</h3>
                    <p className="text-sm text-muted-foreground">End-to-end encrypted messaging</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 border-2">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-heading font-bold">Contact Form</CardTitle>
                  <CardDescription className="text-base">
                    All fields marked with * are required. Your information is kept strictly confidential.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 block">First Name *</label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Last Name *</label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">Email Address *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-12"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Phone Number</label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Country *</label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => setFormData({ ...formData, country: value })}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="ae">United Arab Emirates</SelectItem>
                          <SelectItem value="sg">Singapore</SelectItem>
                          <SelectItem value="ch">Switzerland</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Company</label>
                      <Input
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Position</label>
                      <Input
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">Service Interest *</label>
                    <Select
                      value={formData.serviceInterest}
                      onValueChange={(value) => setFormData({ ...formData, serviceInterest: value })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wealth-management">Wealth & Asset Management</SelectItem>
                        <SelectItem value="project-funding">Project Funding Solutions</SelectItem>
                        <SelectItem value="private-placements">Private Placements</SelectItem>
                        <SelectItem value="securities-lending">Securities Lending</SelectItem>
                        <SelectItem value="fiduciary-services">Fiduciary & Trust Services</SelectItem>
                        <SelectItem value="credit-enhancement">Credit Enhancement</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">Investment/Funding Amount</label>
                    <Select
                      value={formData.investmentAmount}
                      onValueChange={(value) => setFormData({ ...formData, investmentAmount: value })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select amount range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-5m">$1M - $5M</SelectItem>
                        <SelectItem value="5-25m">$5M - $25M</SelectItem>
                        <SelectItem value="25-100m">$25M - $100M</SelectItem>
                        <SelectItem value="100m+">$100M+</SelectItem>
                        <SelectItem value="undisclosed">Prefer not to disclose</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">Message *</label>
                    <Textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please describe your requirements and objectives..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Preferred Contact Method</label>
                      <Select
                        value={formData.preferredContact}
                        onValueChange={(value) => setFormData({ ...formData, preferredContact: value })}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="meeting">In-person Meeting</SelectItem>
                          <SelectItem value="video">Video Conference</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Urgency</label>
                      <Select
                        value={formData.urgency}
                        onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">Urgent (within 24 hours)</SelectItem>
                          <SelectItem value="high">High (within 48 hours)</SelectItem>
                          <SelectItem value="normal">Normal (within 1 week)</SelectItem>
                          <SelectItem value="low">Low (no rush)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {submitError && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{submitError}</span>
                    </div>
                  )}

                  <Button 
                    onClick={handleSubmit}
                    disabled={!validateForm() || isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        Send Message
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By submitting this form, you agree to our privacy policy and terms of service. Your information is
                    encrypted and kept strictly confidential.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
