import { Resend } from 'resend'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return new Resend(key)
}

interface EmailParams {
  type: 'business_loan' | 'contact' | 'general_inquiry'
  data: Record<string, any>
  applicationId: string
}

export async function sendApplicationNotification({ type, data, applicationId }: EmailParams) {
  try {
    // Validate Resend API key is available
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return { success: false, error: 'Email service not configured' }
    }

    const subject = getEmailSubject(type)
    const htmlContent = generateEmailContent(type, data, applicationId)
    
    const resend = getResend()
    const result = await resend.emails.send({
      from: 'Stable Value Capital <noreply@stablevaluecapital.com>',
      to: ['info@stablevaluecapital.com'],
      subject,
      html: htmlContent,
    })
    
    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

function getEmailSubject(type: string): string {
  switch (type) {
    case 'business_loan':
      return 'New Business Loan Application - Stable Value Capital'
    case 'contact':
      return 'New Contact Form Submission - Stable Value Capital'
    case 'general_inquiry':
      return 'New General Inquiry - Stable Value Capital'
    default:
      return 'New Application - Stable Value Capital'
  }
}

function generateEmailContent(type: string, data: Record<string, any>, applicationId: string): string {
  const baseStyles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5; }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
      .header { background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
      .content { padding: 30px; }
      .field { margin-bottom: 15px; }
      .field-label { font-weight: 600; color: #374151; margin-bottom: 5px; }
      .field-value { color: #6b7280; background: #f9fafb; padding: 8px 12px; border-radius: 4px; border-left: 3px solid #3b82f6; }
      .meta { background: #f9fafb; padding: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
      .highlight { color: #3b82f6; font-weight: 600; }
    </style>
  `

  let content = `
    ${baseStyles}
    <div class="container">
      <div class="header">
        <h1>Stable Value Capital</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">New ${getFormTypeName(type)}</p>
      </div>
      <div class="content">
        <h2 style="color: #111827; margin-top: 0;">Application Details</h2>
  `

  // Add form-specific content
  if (type === 'business_loan') {
    content += generateBusinessLoanContent(data)
  } else if (type === 'contact') {
    content += generateContactContent(data)
  } else {
    content += generateGeneralContent(data)
  }

  content += `
      </div>
      <div class="meta">
        <p><strong>Application ID:</strong> <span class="highlight">${applicationId}</span></p>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Platform:</strong> Stable Value Capital</p>
      </div>
    </div>
  `

  return content
}

function getFormTypeName(type: string): string {
  switch (type) {
    case 'business_loan':
      return 'Business Loan Application'
    case 'contact':
      return 'Contact Form Submission'
    case 'general_inquiry':
      return 'General Inquiry'
    default:
      return 'Application Submission'
  }
}

function generateBusinessLoanContent(data: Record<string, any>): string {
  return `
    <div class="field">
      <div class="field-label">Company Information</div>
      <div class="field-value">
        <strong>${escapeHtml(data.companyName || 'N/A')}</strong><br>
        Industry: ${escapeHtml(data.industry || 'N/A')}<br>
        Established: ${escapeHtml(data.companyAge || 'N/A')}<br>
        Annual Revenue: ${escapeHtml(data.annualRevenue || 'N/A')}
      </div>
    </div>
    <div class="field">
      <div class="field-label">Contact Person</div>
      <div class="field-value">
        ${escapeHtml(data.firstName || '')} ${escapeHtml(data.lastName || '')}<br>
        Title: ${escapeHtml(data.title || 'N/A')}<br>
        Email: ${escapeHtml(data.email || 'N/A')}<br>
        Phone: ${escapeHtml(data.phone || 'N/A')}
      </div>
    </div>
    <div class="field">
      <div class="field-label">Loan Requirements</div>
      <div class="field-value">
        Amount Requested: ${escapeHtml(data.loanAmount || 'N/A')}<br>
        Purpose: ${escapeHtml(data.loanPurpose || 'N/A')}<br>
        Term: ${escapeHtml(data.loanTerm || 'N/A')}<br>
        Collateral: ${escapeHtml(Array.isArray(data.collateral) ? data.collateral.join(', ') : (data.collateral || 'N/A'))}
      </div>
    </div>
    <div class="field">
      <div class="field-label">Financial Information</div>
      <div class="field-value">
        Personal Credit Score: ${escapeHtml(data.personalCreditScore || 'N/A')}<br>
        Business Credit Score: ${escapeHtml(data.businessCreditScore || 'N/A')}<br>
        Annual Revenue: ${escapeHtml(data.annualRevenue || 'N/A')}<br>
        Existing Debt: ${escapeHtml(data.existingDebt || 'N/A')}
      </div>
    </div>
    ${data.additionalFinancialInfo ? `
    <div class="field">
      <div class="field-label">Additional Information</div>
      <div class="field-value">${escapeHtml(data.additionalFinancialInfo)}</div>
    </div>
    ` : ''}
  `
}

function generateContactContent(data: Record<string, any>): string {
  return `
    <div class="field">
      <div class="field-label">Contact Information</div>
      <div class="field-value">
        ${escapeHtml(data.firstName || '')} ${escapeHtml(data.lastName || '')}<br>
        Email: ${escapeHtml(data.email || 'N/A')}<br>
        Phone: ${escapeHtml(data.phone || 'N/A')}<br>
        Company: ${escapeHtml(data.company || 'N/A')}<br>
        Position: ${escapeHtml(data.position || 'N/A')}<br>
        Country: ${escapeHtml(data.country || 'N/A')}
      </div>
    </div>
    <div class="field">
      <div class="field-label">Inquiry Details</div>
      <div class="field-value">
        Service Interest: ${escapeHtml(data.serviceInterest || 'N/A')}<br>
        Investment Amount: ${escapeHtml(data.investmentAmount || 'N/A')}<br>
        Preferred Contact: ${escapeHtml(data.preferredContact || 'N/A')}<br>
        Urgency: ${escapeHtml(data.urgency || 'N/A')}
      </div>
    </div>
    ${data.message ? `
    <div class="field">
      <div class="field-label">Message</div>
      <div class="field-value">${escapeHtml(data.message)}</div>
    </div>
    ` : ''}
  `
}

// Helper function to escape HTML to prevent injection
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function generateGeneralContent(data: Record<string, any>): string {
  let content = ''
  Object.entries(data).forEach(([key, value]) => {
    if (value && value !== '') {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      content += `
        <div class="field">
          <div class="field-label">${escapeHtml(label)}</div>
          <div class="field-value">${escapeHtml(String(value))}</div>
        </div>
      `
    }
  })
  return content
}
