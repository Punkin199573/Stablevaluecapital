'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Mail, FileText, LogOut, Send, Users, History, CheckCircle, Clock, AlertCircle, Loader2, Trash2, Eye } from 'lucide-react'

interface FormSubmission {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  subject?: string
  message: string
  status: 'new' | 'reviewing' | 'responded'
  created_at: string
}

interface NewsletterCampaign {
  id: string
  title: string
  content: string
  html_content?: string
  status: string
  sent_at?: string
  recipient_count: number
  sent_count: number
  failed_count: number
  created_at: string
}

export default function AdminDashboard() {
  const [adminToken, setAdminToken] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([])
  const [loading, setLoading] = useState(false)
  const [campaignsLoading, setCampaignsLoading] = useState(false)

  // Newsletter form state
  const [newsletterTitle, setNewsletterTitle] = useState('')
  const [newsletterContent, setNewsletterContent] = useState('')
  const [newsletterHtmlContent, setNewsletterHtmlContent] = useState('')
  const [recipientEmails, setRecipientEmails] = useState('')
  const [sendingNewsletter, setSendingNewsletter] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Email templates
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom')

  const emailTemplates = [
    {
      id: 'marketing',
      name: 'Marketing Outreach',
      subject: 'Strategic Investment & Funding Solutions from Stable Value Capital',
      content: `Dear Sir/Madam,

I trust you are doing well.

My name is Adams Fenton, and I represent Stable Value Capital, a firm dedicated to helping businesses secure the capital and strategic financial partnerships they need to achieve sustainable growth and long-term success.

At Stable Value Capital, we work closely with a network of reputable private investors, private equity firms, and funding partners actively seeking opportunities to invest in promising businesses and commercially viable projects across various sectors.

Whether you are:
• Launching a new venture with strong growth potential
• Seeking expansion capital for an existing business
• Looking to revive or complete an ongoing project
• Exploring funding solutions to scale operations, acquire assets, or enter new markets

we may be able to connect you with the right investment partners and financing solutions.

What differentiates our approach is our access to investors who are prepared to move quickly when presented with well-structured opportunities. Our funding partners are open to reviewing proposals from diverse industries and regions, provided the business model demonstrates clear value, scalability, and profitability.

Our team is committed to maintaining the highest standards of professionalism, confidentiality, and transparency throughout the funding process. From the initial review of your proposal to investor introductions and transaction support, we work closely with our clients to maximize the likelihood of a successful outcome.

To learn more about our services, please visit our website: www.stablevaluecapital.com

If your business or project requires investment, project financing, working capital, acquisition funding, or strategic financial support, we would welcome the opportunity to discuss your objectives.

Simply reply to this email with a brief overview of your business or project, your funding requirements, and any relevant supporting information. We will review your submission and respond promptly with potential funding pathways and next steps.

We look forward to helping you unlock new opportunities for growth and success.

Warm regards,
Adams Fenton
Investment Consultant & Loan Sourcing Specialist
Stable Value Capital
Website: www.stablevaluecapital.com`,
    },
    {
      id: 'welcome',
      name: 'Newsletter Welcome',
      subject: 'Welcome to Stable Value Capital Newsletter',
      content: `Welcome to the Stable Value Capital community!

Thank you for subscribing to our newsletter. You're now part of an exclusive group receiving:

• Investment insights and market analysis
• Exclusive private placement opportunities
• Wealth management strategies
• Project funding updates
• Market trend reports

What to expect:
We send updates once or twice a month, focusing on high-quality opportunities and educational content to help you make informed investment decisions.

Our Services:
- Wealth Management & Portfolio Optimization
- Private Placements & Strategic Funds
- Project Funding & Capital Solutions
- Business Loans & Credit Enhancement
- Securities Lending Programs

Have questions? Simply reply to any of our emails, and our team will personally respond.

Visit us at: www.stablevaluecapital.com

Best regards,
The Stable Value Capital Team`,
    },
    {
      id: 'followup',
      name: 'Follow-Up Inquiry',
      subject: 'Following Up on Your Interest in Stable Value Capital',
      content: `Dear [Client Name],

Thank you for your interest in Stable Value Capital. I wanted to personally follow up to see how we can assist you with your investment or funding needs.

At Stable Value Capital, we specialize in:

✓ Wealth Management for High-Net-Worth Individuals
✓ Private Placement Opportunities (Min. $1M)
✓ Project Funding Solutions ($10M+)
✓ Business Loans & Credit Enhancement
✓ Securities Lending Programs

Whether you're an accredited investor seeking exclusive opportunities or a business looking for strategic funding, our team is ready to help.

Next Steps:
1. Reply to this email with your specific requirements
2. Schedule a consultation at your convenience
3. Receive a customized proposal

Our commitment: Professional service, confidentiality, and transparency throughout the process.

Ready to explore what we can do together?

Contact us: info@stablevaluecapital.com
Website: www.stablevaluecapital.com
Phone: +1 404 295 8687

Warm regards,
The Stable Value Capital Team`,
    },
  ]

  // Check for token in URL or in local storage and validate it
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token') || localStorage.getItem('admin_token')

    if (token) {
      setAdminToken(token)
      validateAdminToken(token)
    }
  }, [])

  async function validateAdminToken(token: string) {
    setAuthLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/validate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        localStorage.removeItem('admin_token')
        setIsAuthenticated(false)
        setMessage({ type: 'error', text: 'Invalid or expired admin token' })
        return false
      }

      setIsAuthenticated(true)
      localStorage.setItem('admin_token', token)
      setMessage({ type: 'success', text: 'Admin access granted' })
      fetchSubmissions(token)
      fetchCampaigns(token)
      return true
    } catch (error) {
      console.error('[v0] Token validation error:', error)
      setMessage({ type: 'error', text: 'Failed to validate admin token' })
      return false
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!adminToken.trim()) {
      setMessage({ type: 'error', text: 'Please enter your admin token' })
      return
    }

    await validateAdminToken(adminToken)
  }

  const fetchSubmissions = async (token?: string) => {
    const authToken = token || adminToken
    setLoading(true)
    try {
      const response = await fetch('/api/admin/submissions', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setSubmissions(data.submissions)
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch submissions' })
    } finally {
      setLoading(false)
    }
  }

  const fetchCampaigns = async (token?: string) => {
    const authToken = token || adminToken
    setCampaignsLoading(true)
    try {
      const response = await fetch('/api/admin/campaigns', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setCampaigns(data.campaigns || [])
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    } finally {
      setCampaignsLoading(false)
    }
  }

  const handleUpdateStatus = async (submissionId: string, newStatus: 'new' | 'reviewing' | 'responded') => {
    try {
      const response = await fetch('/api/admin/submissions', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId,
          status: newStatus,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setSubmissions(submissions.map(s => s.id === submissionId ? { ...s, status: newStatus } : s))
        setMessage({ type: 'success', text: 'Status updated successfully' })
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update status' })
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setNewsletterTitle(template.subject)
      setNewsletterContent(template.content)
    } else {
      setSelectedTemplate('custom')
      setNewsletterTitle('')
      setNewsletterContent('')
    }
  }

  const handleSendNewsletter = async (testMode: boolean = false, testEmail?: string) => {
    if (!newsletterTitle || !newsletterContent) {
      setMessage({ type: 'error', text: 'Please fill in title and content' })
      return
    }

    if (testMode && !testEmail) {
      setMessage({ type: 'error', text: 'Test email address required' })
      return
    }

    setSendingNewsletter(true)
    try {
      const body: any = {
        title: newsletterTitle,
        content: newsletterContent,
        useTemplate: selectedTemplate !== 'custom',
      }

      if (newsletterHtmlContent) {
        body.htmlContent = newsletterHtmlContent
      }

      if (testMode) {
        body.testMode = true
        body.testEmail = testEmail
      } else if (recipientEmails.trim()) {
        const emails = recipientEmails.split(',').map(e => e.trim()).filter(e => e)
        if (emails.length > 0) {
          body.recipientEmails = emails
        }
      }

      const response = await fetch('/api/admin/newsletter-send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      if (data.success) {
        setMessage({
          type: 'success',
          text: testMode
            ? `Test email sent to ${testEmail}`
            : `Newsletter sent to ${data.sent} recipients, ${data.failed} failed`,
        })
        if (!testMode) {
          setNewsletterTitle('')
          setNewsletterContent('')
          setNewsletterHtmlContent('')
          setRecipientEmails('')
          setSelectedTemplate('custom')
          fetchCampaigns()
        }
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send newsletter' })
    } finally {
      setSendingNewsletter(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-900 to-blue-900 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">SVC</span>
            </div>
            <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
            <CardDescription>Enter your admin token to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Admin token"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              disabled={authLoading}
              className="h-12"
            />
            {message && (
              <div className={`p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                {message.text}
              </div>
            )}
            <Button onClick={handleLogin} className="w-full h-12 bg-gradient-to-r from-slate-900 to-blue-900 hover:from-slate-800 hover:to-blue-800" disabled={authLoading}>
              {authLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : 'Login'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-blue-900 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">SVC</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-sm text-slate-500">Manage submissions and newsletters</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setIsAuthenticated(false)
                setAdminToken('')
                localStorage.removeItem('admin_token')
              }}
              className="border-slate-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {message.text}
          </div>
        )}

        <Tabs defaultValue="newsletter" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
            <TabsTrigger value="newsletter" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-900 data-[state=active]:to-blue-900 data-[state=active]:text-white">
              <Mail className="w-4 h-4 mr-2" />
              Send Newsletter
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-900 data-[state=active]:to-blue-900 data-[state=active]:text-white">
              <History className="w-4 h-4 mr-2" />
              Campaign History
            </TabsTrigger>
            <TabsTrigger value="submissions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-900 data-[state=active]:to-blue-900 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Form Submissions
            </TabsTrigger>
          </TabsList>

          {/* Newsletter Tab */}
          <TabsContent value="newsletter" className="space-y-6 mt-6">
            <Card className="shadow-lg border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Compose Newsletter
                </CardTitle>
                <CardDescription>Send professional marketing emails or newsletters to your subscribers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Email Template
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Button
                      onClick={() => handleTemplateSelect('custom')}
                      variant={selectedTemplate === 'custom' ? 'default' : 'outline'}
                      className={selectedTemplate === 'custom' ? 'bg-gradient-to-r from-slate-900 to-blue-900' : ''}
                    >
                      Custom Email
                    </Button>
                    {emailTemplates.map(template => (
                      <Button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.id)}
                        variant={selectedTemplate === template.id ? 'default' : 'outline'}
                        className={selectedTemplate === template.id ? 'bg-gradient-to-r from-slate-900 to-blue-900' : ''}
                      >
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Newsletter Title *
                  </label>
                  <Input
                    placeholder="e.g., Market Insights - May 2024"
                    value={newsletterTitle}
                    onChange={(e) => setNewsletterTitle(e.target.value)}
                    className="h-12 border-slate-200 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Newsletter Content (Plain Text) *
                  </label>
                  <Textarea
                    placeholder="Write your newsletter content here..."
                    value={newsletterContent}
                    onChange={(e) => setNewsletterContent(e.target.value)}
                    rows={12}
                    className="border-slate-200 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Custom Recipients (Optional)
                  </label>
                  <Textarea
                    placeholder="Enter email addresses separated by commas (e.g., user1@example.com, user2@example.com). Leave empty to send to all newsletter subscribers."
                    value={recipientEmails}
                    onChange={(e) => setRecipientEmails(e.target.value)}
                    rows={3}
                    className="border-slate-200 focus:border-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    If empty, newsletter will be sent to all active newsletter subscribers.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleSendNewsletter(false)}
                    disabled={sendingNewsletter}
                    className="h-14 bg-gradient-to-r from-slate-900 to-blue-900 hover:from-slate-800 hover:to-blue-800 shadow-lg"
                  >
                    {sendingNewsletter ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Newsletter
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleSendNewsletter(true, 'punkin199573@gmail.com')}
                    disabled={sendingNewsletter}
                    variant="outline"
                    className="h-14 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                  >
                    {sendingNewsletter ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Send Test to punkin199573@gmail.com
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Template Mode:</strong> When using a template, a professional HTML design with your company branding will wrap your content automatically.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaign History Tab */}
          <TabsContent value="campaigns" className="space-y-4 mt-6">
            <Card className="shadow-lg border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5 text-blue-600" />
                      Campaign History
                    </CardTitle>
                    <CardDescription>View past newsletter campaigns and their performance</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fetchCampaigns()}
                    disabled={campaignsLoading}
                  >
                    {campaignsLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Refresh'
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {campaigns.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Mail className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">No campaigns yet</p>
                    <p className="text-sm">Send your first newsletter to see it here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <Card key={campaign.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-bold text-lg text-slate-900">{campaign.title}</h4>
                              <p className="text-sm text-slate-500">
                                Created: {new Date(campaign.created_at).toLocaleString()}
                              </p>
                            </div>
                            <Badge
                              variant="secondary"
                              className={`${
                                campaign.status === 'sent'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : campaign.status === 'failed'
                                  ? 'bg-red-100 text-red-800 border-red-200'
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              }`}
                            >
                              {campaign.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="bg-slate-50 rounded-lg p-3">
                              <div className="text-slate-500 mb-1">Recipients</div>
                              <div className="font-bold text-lg text-slate-900">{campaign.recipient_count}</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                              <div className="text-green-600 mb-1 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Sent
                              </div>
                              <div className="font-bold text-lg text-green-700">{campaign.sent_count}</div>
                            </div>
                            <div className="bg-red-50 rounded-lg p-3">
                              <div className="text-red-600 mb-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Failed
                              </div>
                              <div className="font-bold text-lg text-red-700">{campaign.failed_count}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Form Submissions Tab */}
          <TabsContent value="submissions" className="space-y-4 mt-6">
            <Card className="shadow-lg border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Form Submissions
                    </CardTitle>
                    <CardDescription>View and manage contact form submissions</CardDescription>
                  </div>
                  <Button
                    onClick={() => fetchSubmissions()}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Refresh'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {submissions.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">No submissions yet</p>
                    <p className="text-sm">Form submissions will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <Card key={submission.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm text-slate-500">Name</p>
                                <p className="font-semibold text-slate-900">{submission.first_name} {submission.last_name}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">Email</p>
                                <p className="font-semibold text-slate-900">{submission.email}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">Phone</p>
                                <p className="font-semibold text-slate-900">{submission.phone || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">Date</p>
                                <p className="font-semibold text-slate-900">{new Date(submission.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            {submission.subject && (
                              <div>
                                <p className="text-sm text-slate-500">Subject</p>
                                <p className="text-slate-900">{submission.subject}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-slate-500">Message</p>
                              <p className="whitespace-pre-wrap text-slate-900 bg-slate-50 p-3 rounded-lg">{submission.message}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-500 mb-2">Status</p>
                              <div className="flex gap-2">
                                {(['new', 'reviewing', 'responded'] as const).map((status) => (
                                  <Button
                                    key={status}
                                    size="sm"
                                    variant={submission.status === status ? 'default' : 'outline'}
                                    onClick={() => handleUpdateStatus(submission.id, status)}
                                    className={submission.status === status ? 'bg-gradient-to-r from-slate-900 to-blue-900' : ''}
                                  >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
