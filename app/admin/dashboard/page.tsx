'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Mail, FileText, LogOut, Send, Users, History, CircleCheck as CheckCircle, Clock, CircleAlert as AlertCircle, Loader as Loader2, TrendingUp, Eye, ChartBar as BarChart3, RefreshCw, ChevronLeft, ChevronRight, X, Download } from 'lucide-react'

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
  opens_count?: number
  clicks_count?: number
  delivered_count?: number
  bounced_count?: number
  last_analytics_sync?: string
  created_at: string
}

interface AnalyticsStats {
  totalSent: number
  delivered: number
  bounced: number
  opened: number
  clicked: number
  complained: number
}

interface EmailLog {
  id: string
  email: string
  status: string
  sentAt?: string
  deliveredAt?: string
  openedAt?: string
  subject?: string
}

export default function AdminDashboard() {
  const [adminToken, setAdminToken] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([])
  const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats | null>(null)
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(false)
  const [campaignsLoading, setCampaignsLoading] = useState(false)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [syncingCampaign, setSyncingCampaign] = useState<string | null>(null)

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
- Launching a new venture with strong growth potential
- Seeking expansion capital for an existing business
- Looking to revive or complete an ongoing project
- Exploring funding solutions to scale operations, acquire assets, or enter new markets

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
      id: 'marketing2',
      name: 'Marketing Outreach 2',
      subject: 'Unlock Capital for Your Vision | Stable Value Capital',
      content: `Dear Sir/Madam,

I trust this message finds you well.

My name is Adams Fenton, and I represent Stable Value Capital, a firm dedicated to helping businesses secure the capital and strategic financial partnerships they need to achieve sustainable growth and long-term success.

At Stable Value Capital, we work closely with a network of reputable private investors, private equity firms, and funding partners actively seeking opportunities to invest in promising businesses and commercially viable projects across various sectors.

Whether you are:
- Launching a new venture with strong growth potential
- Seeking expansion capital for an existing business
- Looking to revive or complete an ongoing project
- Exploring funding solutions to scale operations

We can connect you with the right investment partners and financing solutions.

What differentiates our approach is our access to investors who are prepared to move quickly when presented with well-structured opportunities. Our funding partners are open to reviewing proposals from diverse industries and regions, provided the business model demonstrates clear value, scalability, and profitability.

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

- Investment insights and market analysis
- Exclusive private placement opportunities
- Wealth management strategies
- Project funding updates
- Market trend reports

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

Wealth Management for High-Net-Worth Individuals
Private Placement Opportunities (Min. $1M)
Project Funding Solutions ($10M+)
Business Loans & Credit Enhancement
Securities Lending Programs

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
      fetchAnalytics(token)
      return true
    } catch (error) {
      console.error('[Admin] Token validation error:', error)
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
        headers: { 'Authorization': `Bearer ${authToken}` },
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
        headers: { 'Authorization': `Bearer ${authToken}` },
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

  const fetchAnalytics = async (token?: string, campaignId?: string) => {
    const authToken = token || adminToken
    setAnalyticsLoading(true)
    try {
      const url = campaignId
        ? `/api/admin/analytics?campaignId=${campaignId}`
        : '/api/admin/analytics'
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      })
      const data = await response.json()
      if (data.success) {
        setAnalyticsStats(data.stats)
        if (data.emailLogs) {
          setEmailLogs(data.emailLogs)
        }
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const syncCampaignAnalytics = async (campaignId: string) => {
    setSyncingCampaign(campaignId)
    try {
      const response = await fetch('/api/admin/analytics', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaignId }),
      })
      const data = await response.json()
      if (data.success) {
        fetchCampaigns()
        fetchAnalytics(undefined, campaignId)
        setMessage({ type: 'success', text: `Synced ${data.totalProcessed || 0} emails` })
      } else {
        setMessage({ type: 'error', text: data.error || 'Sync failed' })
      }
    } catch (error) {
      console.error('Failed to sync analytics:', error)
      setMessage({ type: 'error', text: 'Failed to sync analytics' })
    } finally {
      setSyncingCampaign(null)
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
        body: JSON.stringify({ submissionId, status: newStatus }),
      })
      const data = await response.json()
      if (data.success) {
        setSubmissions(submissions.map(s => s.id === submissionId ? { ...s, status: newStatus } : s))
        setMessage({ type: 'success', text: 'Status updated' })
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
        templateId: selectedTemplate,
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
            : `Newsletter sent: ${data.sent} successful, ${data.failed} failed`,
        })
        if (!testMode) {
          setNewsletterTitle('')
          setNewsletterContent('')
          setNewsletterHtmlContent('')
          setRecipientEmails('')
          setSelectedTemplate('custom')
          fetchCampaigns()
          fetchAnalytics()
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'sent':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'opened':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'clicked':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'bounced':
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'complained':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
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
                <p className="text-sm text-slate-500">Manage newsletters, campaigns, and submissions</p>
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
            <div className="flex justify-between items-center">
              {message.text}
              <button onClick={() => setMessage(null)} className="ml-4"><X className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        <Tabs defaultValue="newsletter" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="newsletter" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-900 data-[state=active]:to-blue-900 data-[state=active]:text-white">
              <Mail className="w-4 h-4 mr-2" />
              Send Campaign
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-900 data-[state=active]:to-blue-900 data-[state=active]:text-white">
              <History className="w-4 h-4 mr-2" />
              Campaign History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-900 data-[state=active]:to-blue-900 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics & Logs
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
                  Compose Email Campaign
                </CardTitle>
                <CardDescription>Send marketing emails or newsletters to your subscribers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Email Template
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
                    Subject Line *
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
                    Email Content (Plain Text) *
                  </label>
                  <Textarea
                    placeholder="Write your email content here..."
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
                    placeholder="Enter email addresses separated by commas. Leave empty to send to all newsletter subscribers."
                    value={recipientEmails}
                    onChange={(e) => setRecipientEmails(e.target.value)}
                    rows={3}
                    className="border-slate-200 focus:border-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    Supports unlimited recipients. Leave empty to use all subscribers.
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
                        Send Campaign
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
                        Send Test Email
                      </>
                    )}
                  </Button>
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
                    <CardDescription>View past campaigns and their performance</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fetchCampaigns()}
                    disabled={campaignsLoading}
                  >
                    {campaignsLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {campaigns.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Mail className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">No campaigns yet</p>
                    <p className="text-sm">Send your first campaign to see it here</p>
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
                                {new Date(campaign.created_at).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="secondary" className={campaign.status === 'sent' ? 'bg-green-100 text-green-800' : campaign.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                              {campaign.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mb-4">
                            <div className="bg-slate-50 rounded-lg p-3">
                              <div className="text-slate-500 mb-1">Recipients</div>
                              <div className="font-bold text-lg text-slate-900">{campaign.recipient_count?.toLocaleString()}</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                              <div className="text-green-600 mb-1 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Sent
                              </div>
                              <div className="font-bold text-lg text-green-700">{campaign.sent_count?.toLocaleString()}</div>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-3">
                              <div className="text-blue-600 mb-1 flex items-center gap-1">
                                <Eye className="w-3 h-3" /> Opens
                              </div>
                              <div className="font-bold text-lg text-blue-700">{campaign.opens_count || 0}</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                              <div className="text-purple-600 mb-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Clicks
                              </div>
                              <div className="font-bold text-lg text-purple-700">{campaign.clicks_count || 0}</div>
                            </div>
                            <div className="bg-red-50 rounded-lg p-3">
                              <div className="text-red-600 mb-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Failed
                              </div>
                              <div className="font-bold text-lg text-red-700">{campaign.failed_count || 0}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                fetchAnalytics(undefined, campaign.id)
                              }}
                            >
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => syncCampaignAnalytics(campaign.id)}
                              disabled={syncingCampaign === campaign.id}
                            >
                              {syncingCampaign === campaign.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3 h-3 mr-1" />
                              )}
                              Sync Stats
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4 mt-6">
            {/* Stats Overview */}
            <Card className="shadow-lg border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Email Analytics
                    </CardTitle>
                    <CardDescription>Track email delivery, opens, clicks, and engagement</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fetchAnalytics()}
                    disabled={analyticsLoading}
                  >
                    {analyticsLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {analyticsStats ? (
                  <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
                        <CardContent className="pt-6 text-center">
                          <Mail className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                          <div className="text-3xl font-bold text-slate-900">{analyticsStats.totalSent?.toLocaleString()}</div>
                          <div className="text-sm text-slate-500">Total Sent</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardContent className="pt-6 text-center">
                          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                          <div className="text-3xl font-bold text-green-700">{analyticsStats.delivered?.toLocaleString()}</div>
                          <div className="text-sm text-green-600">Delivered</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="pt-6 text-center">
                          <Eye className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                          <div className="text-3xl font-bold text-blue-700">{analyticsStats.opened?.toLocaleString()}</div>
                          <div className="text-sm text-blue-600">Opened</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="pt-6 text-center">
                          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                          <div className="text-3xl font-bold text-purple-700">{analyticsStats.clicked?.toLocaleString()}</div>
                          <div className="text-sm text-purple-600">Clicked</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                        <CardContent className="pt-6 text-center">
                          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                          <div className="text-3xl font-bold text-red-700">{analyticsStats.bounced?.toLocaleString()}</div>
                          <div className="text-sm text-red-600">Bounced</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                        <CardContent className="pt-6 text-center">
                          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                          <div className="text-3xl font-bold text-orange-700">{analyticsStats.complained?.toLocaleString()}</div>
                          <div className="text-sm text-orange-600">Spam Reports</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Engagement Rates */}
                    <Card className="border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Engagement Rates</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-slate-600">Delivery Rate</span>
                              <span className="text-sm font-bold text-slate-900">
                                {analyticsStats.totalSent > 0 ? Math.round((analyticsStats.delivered / analyticsStats.totalSent) * 100) : 0}%
                              </span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${analyticsStats.totalSent > 0 ? (analyticsStats.delivered / analyticsStats.totalSent) * 100 : 0}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-slate-600">Open Rate</span>
                              <span className="text-sm font-bold text-slate-900">
                                {analyticsStats.delivered > 0 ? Math.round((analyticsStats.opened / analyticsStats.delivered) * 100) : 0}%
                              </span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${analyticsStats.delivered > 0 ? (analyticsStats.opened / analyticsStats.delivered) * 100 : 0}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-slate-600">Click Rate</span>
                              <span className="text-sm font-bold text-slate-900">
                                {analyticsStats.opened > 0 ? Math.round((analyticsStats.clicked / analyticsStats.opened) * 100) : 0}%
                              </span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${analyticsStats.opened > 0 ? (analyticsStats.clicked / analyticsStats.opened) * 100 : 0}%` }} />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">No analytics data</p>
                    <p className="text-sm">Send some emails to see analytics</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Email Logs */}
            <Card className="shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Email Logs
                </CardTitle>
                <CardDescription>Detailed status of individual emails</CardDescription>
              </CardHeader>
              <CardContent>
                {emailLogs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-2 font-semibold text-slate-600">Recipient</th>
                          <th className="text-left py-3 px-2 font-semibold text-slate-600">Status</th>
                          <th className="text-left py-3 px-2 font-semibold text-slate-600">Sent At</th>
                          <th className="text-left py-3 px-2 font-semibold text-slate-600">Delivered</th>
                          <th className="text-left py-3 px-2 font-semibold text-slate-600">Opened</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emailLogs.slice(0, 50).map((log, index) => (
                          <tr key={log.id || index} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-2 text-slate-900">{log.email}</td>
                            <td className="py-3 px-2">
                              <Badge variant="secondary" className={getStatusColor(log.status)}>
                                {log.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-slate-600">{log.sentAt ? new Date(log.sentAt).toLocaleString() : '-'}</td>
                            <td className="py-3 px-2 text-slate-600">{log.deliveredAt ? new Date(log.deliveredAt).toLocaleString() : '-'}</td>
                            <td className="py-3 px-2 text-slate-600">{log.openedAt ? new Date(log.openedAt).toLocaleString() : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {emailLogs.length > 50 && (
                      <p className="text-center text-sm text-slate-500 mt-4">
                        Showing 50 of {emailLogs.length} emails
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Mail className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <p>No email logs available</p>
                    <p className="text-xs mt-1">Send a campaign to see email logs here</p>
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
                  <Button onClick={() => fetchSubmissions()} disabled={loading}>
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
