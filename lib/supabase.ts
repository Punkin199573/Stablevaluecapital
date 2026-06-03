import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.warn('NEXT_PUBLIC_SUPABASE_URL is not configured');
}
if (!supabaseAnonKey) {
  console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured');
}

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export function getSupabase() {
  if (!supabase) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required to initialize Supabase');
  }
  return supabase;
}

export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required to initialize Supabase admin client');
  }
  return supabaseAdmin;
}

// Database types
export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed';
  subscribed_at: string;
  created_at: string;
  updated_at: string;
}

export interface FormSubmission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'new' | 'reviewing' | 'responded';
  created_at: string;
  updated_at: string;
}

export interface NewsletterCampaign {
  id: string;
  title: string;
  content: string;
  html_content?: string;
  status: 'draft' | 'scheduled' | 'sent';
  sent_at?: string;
  recipient_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Newsletter functions
export async function addNewsletterSubscriber(email: string) {
  try {
    const { data, error } = await getSupabase()
      .from('newsletter_subscribers')
      .insert([
        {
          email,
          status: 'active',
          subscribed_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('[v0] Error adding subscriber:', error);
    return { success: false, error };
  }
}

export async function getNewsletterSubscribers() {
  try {
    const { data, error } = await getSupabase()
      .from('newsletter_subscribers')
      .select('*')
      .eq('status', 'active')
      .order('subscribed_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('[v0] Error fetching subscribers:', error);
    return { success: false, error };
  }
}

export async function unsubscribeFromNewsletter(email: string) {
  try {
    const { data, error } = await getSupabase()
      .from('newsletter_subscribers')
      .update({ status: 'unsubscribed' })
      .eq('email', email)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('[v0] Error unsubscribing:', error);
    return { success: false, error };
  }
}

// Form submission functions
export async function addFormSubmission(submission: Omit<FormSubmission, 'id' | 'created_at' | 'updated_at' | 'status'>) {
  try {
    const { data, error } = await getSupabase()
      .from('form_submissions')
      .insert([
        {
          ...submission,
          status: 'new',
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('[v0] Error adding submission:', error);
    return { success: false, error };
  }
}

export async function getFormSubmissions() {
  try {
    const { data, error } = await getSupabase()
      .from('form_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('[v0] Error fetching submissions:', error);
    return { success: false, error };
  }
}

export async function updateSubmissionStatus(id: string, status: 'new' | 'reviewing' | 'responded') {
  try {
    const { data, error } = await getSupabase()
      .from('form_submissions')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('[v0] Error updating submission:', error);
    return { success: false, error };
  }
}

// Newsletter campaign functions
export async function createNewsletterCampaign(campaign: Omit<NewsletterCampaign, 'id' | 'created_at' | 'updated_at' | 'sent_at'>) {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('newsletter_campaigns')
      .insert([campaign])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('[v0] Error creating campaign:', error);
    return { success: false, error };
  }
}

export async function getNewsletterCampaigns() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('newsletter_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('[v0] Error fetching campaigns:', error);
    return { success: false, error };
  }
}

export async function updateCampaignStatus(id: string, status: 'draft' | 'scheduled' | 'sent', recipientCount?: number) {
  try {
    const updateData: any = { status };
    if (status === 'sent') {
      updateData.sent_at = new Date().toISOString();
    }
    if (recipientCount !== undefined) {
      updateData.recipient_count = recipientCount;
    }

    const { data, error } = await getSupabaseAdmin()
      .from('newsletter_campaigns')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('[v0] Error updating campaign:', error);
    return { success: false, error };
  }
}
