import { NextRequest, NextResponse } from 'next/server';
import { getFormSubmissions, updateSubmissionStatus } from '@/lib/supabase';

// Helper to verify admin token
function verifyAdminToken(token: string): boolean {
  const adminToken = process.env.ADMIN_NEWSLETTER_TOKEN || process.env.NEXT_PUBLIC_ADMIN_TOKEN;
  return !!adminToken && token === adminToken;
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    if (!verifyAdminToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await getFormSubmissions();
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submissions: result.data,
    });
  } catch (error) {
    console.error('[v0] Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    if (!verifyAdminToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { submissionId, status } = body;

    if (!submissionId || !status) {
      return NextResponse.json(
        { error: 'Missing submissionId or status' },
        { status: 400 }
      );
    }

    if (!['new', 'reviewing', 'responded'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const result = await updateSubmissionStatus(submissionId, status);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to update submission' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submission: result.data?.[0],
    });
  } catch (error) {
    console.error('[v0] Error updating submission:', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}
