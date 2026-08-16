import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { kind, resume_url, ...payload } = body;

    const applicantName = payload.full_name || 'Applicant';
    const applicantEmail = payload.email || 'N/A';
    const kindLabel =
      kind === 'executive_board'
        ? 'Executive Board'
        : kind === 'organizing_committee'
        ? 'Organizing Committee'
        : 'Delegate';

    // 1. Send Email Notification to amoghmasna@gmail.com
    try {
      await fetch('https://formsubmit.co/ajax/amoghmasna@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          _subject: `New Reimei MUN ${kindLabel} Application - ${applicantName}`,
          _captcha: 'false',
          'Application Type': kindLabel,
          'Full Name': applicantName,
          Email: applicantEmail,
          Phone: payload.phone || 'N/A',
          Age: payload.age || 'N/A',
          Institution: payload.institution || 'N/A',
          Grade: payload.grade || 'N/A',
          Committee: payload.committee || 'N/A',
          Position: payload.position || 'N/A',
          Department: payload.department || 'N/A',
          'Preference 1': payload.preference_1 || 'N/A',
          'Preference 2': payload.preference_2 || 'N/A',
          'Preference 3': payload.preference_3 || 'N/A',
          Experience: payload.experience || 'N/A',
          'EB Experience': payload.eb_experience || 'N/A'
        })
      });
    } catch (emailErr) {
      console.error('Failed sending email via FormSubmit:', emailErr);
    }

    // 2. Attempt Supabase DB Insert if env vars exist
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from(kind || 'delegates').insert({
          ...payload,
          ...(resume_url ? { resume_url } : {}),
          status: 'pending'
        });
      } catch (dbErr) {
        console.error('Supabase DB Insert Exception:', dbErr);
      }
    }

    return NextResponse.json({ success: true, message: 'Application received successfully' });
  } catch (error: any) {
    console.error('API /api/apply Error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server processing error' },
      { status: 500 }
    );
  }
}
