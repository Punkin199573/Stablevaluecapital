'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Mail, FileText, LogOut, Send } from 'lucide-react'

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
  sent: number
  failed: number
  total: number
}

export default function AdminDashboard() {
  const [adminToken, setAdminToken] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(false)
  const [newsletterTitle, setNewsletterTitle] = useState('')
  const [newsletterContent, setNewsletterContent] = useState('')
  const [newsletterHtmlContent, setNewsletterHtmlContent] = useState('')
  const [recipientEmails, setRecipientEmails] = useState('')
  const [sendingNewsletter, setSendingNewsletter] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Check for token in URL or in local storage and validate it
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token') || (typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null)

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
      }

      if (newsletterHtmlContent) {
        body.htmlContent = newsletterHtmlContent
      }

      if (testMode) {
        body.testMode = true
        body.testEmail = testEmail
      } else if (recipientEmails.trim()) {
        // Split by comma and trim whitespace
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Enter your admin token to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Admin token"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              disabled={authLoading}
            />
            {message && (
              <div className={`p-3 rounded text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {message.text}
              </div>
            )}
            <Button onClick={handleLogin} className="w-full" disabled={authLoading}>
              {authLoading ? 'Authenticating...' : 'Login'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage submissions and send newsletters</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setIsAuthenticated(false)
              setAdminToken('')
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <Tabs defaultValue="submissions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="submissions">
              <FileText className="w-4 h-4 mr-2" />
              Form Submissions
            </TabsTrigger>
            <TabsTrigger value="newsletter">
              <Mail className="w-4 h-4 mr-2" />
              Send Newsletter
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Form Submissions</CardTitle>
                <CardDescription>View and manage contact form submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => fetchSubmissions()}
                  disabled={loading}
                  className="mb-4"
                >
                  {loading ? 'Loading...' : 'Refresh Submissions'}
                </Button>

                <div className="space-y-4">
                  {submissions.length === 0 ? (
                    <p className="text-gray-500">No submissions yet</p>
                  ) : (
                    submissions.map((submission) => (
                      <Card key={submission.id} className="bg-white">
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="font-semibold">{submission.first_name} {submission.last_name}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-semibold">{submission.email}</p>
                              </div>
                            </div>
                            {submission.subject && (
                              <div>
                                <p className="text-sm text-gray-600">Subject</p>
                                <p>{submission.subject}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-gray-600">Message</p>
                              <p className="whitespace-pre-wrap">{submission.message}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Status</p>
                              <div className="flex gap-2 mt-2">
                                {(['new', 'reviewing', 'responded'] as const).map((status) => (
                                  <Button
                                    key={status}
                                    size="sm"
                                    variant={submission.status === status ? 'default' : 'outline'}
                                    onClick={() => handleUpdateStatus(submission.id, status)}
                                  >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </Button>
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">
                              Submitted: {new Date(submission.created_at).toLocaleString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="newsletter">
            <Card>
              <CardHeader>
                <CardTitle>Send Newsletter</CardTitle>
                <CardDescription>Compose and send newsletter to subscribers or custom recipients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Newsletter Title
                  </label>
                  <Input
                    placeholder="e.g., Market Insights - May 2024"
                    value={newsletterTitle}
                    onChange={(e) => setNewsletterTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Newsletter Content (Plain Text)
                  </label>
                  <Textarea
                    placeholder="Write your newsletter content here..."
                    value={newsletterContent}
                    onChange={(e) => setNewsletterContent(e.target.value)}
                    rows={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HTML Content (Optional)
                  </label>
                  <Textarea
                    placeholder="Paste your custom HTML here (optional - will override plain text formatting)..."
                    value={newsletterHtmlContent}
                    onChange={(e) => setNewsletterHtmlContent(e.target.value)}
                    rows={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    If provided, HTML content will be used instead of plain text. Leave empty to use auto-formatted plain text.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Recipients (Optional)
                  </label>
                  <Textarea
                    placeholder="Enter email addresses separated by commas (e.g., user1@example.com, user2@example.com). Leave empty to send to all newsletter subscribers."
                    value={recipientEmails}
                    onChange={(e) => setRecipientEmails(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    If empty, newsletter will be sent to all active newsletter subscribers.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    onClick={() => handleSendNewsletter(false)}
                    disabled={sendingNewsletter}
                    className="flex-1"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sendingNewsletter ? 'Sending...' : 'Send Newsletter'}
                  </Button>
                  <Button
                    onClick={() => handleSendNewsletter(true, 'punkin199573@gmail.com')}
                    disabled={sendingNewsletter}
                    variant="outline"
                    className="flex-1"
                  >
                    📧 Send Test to punkin199573@gmail.com
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
