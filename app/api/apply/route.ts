import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const kinds = ['delegates', 'executive_board', 'organizing_committee'] as const;
type Kind = (typeof kinds)[number];
const committees = ['DISEC', 'UNHRC', 'International Press', 'Lok Sabha', 'FIFA', 'UNSC'];
const departments = ['Delegate Affairs', 'Logistics', 'Media & Design', 'Marketing & Outreach', 'Technical Team'];

const text = (value: unknown, maxLength = 2000) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const kind = body.kind;
    if (!kinds.includes(kind)) return NextResponse.json({ message: 'Invalid application type.' }, { status: 400 });

    const full_name = text(body.full_name, 120);
    const email = text(body.email, 254).toLowerCase();
    const phone = text(body.phone, 40);
    const institution = text(body.institution, 160);
    const experience = text(body.experience);
    const age = Number(body.age);
    if (!full_name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !phone || !institution || !experience || !Number.isInteger(age) || age < 10 || age > 100) {
      return NextResponse.json({ message: 'Please complete all required fields with valid information.' }, { status: 400 });
    }

    let application: Record<string, string | number> = { full_name, email, phone, institution, experience, age };
    if (kind === 'delegates') {
      const grade = text(body.grade, 80);
      const preferences = [text(body.preference_1, 80), text(body.preference_2, 80), text(body.preference_3, 80)];
      if (!grade || preferences.some((item) => !committees.includes(item)) || new Set(preferences).size !== 3) {
        return NextResponse.json({ message: 'Choose three different committee preferences.' }, { status: 400 });
      }
      application = { ...application, grade, preference_1: preferences[0], preference_2: preferences[1], preference_3: preferences[2] };
    } else if (kind === 'executive_board') {
      const committee = text(body.committee, 80);
      const position = text(body.position, 80);
      const eb_experience = text(body.eb_experience);
      const resume_url = text(body.resume_url, 300);
      if (!committees.includes(committee) || !['Chair', 'Vice Chair', 'Rapporteur'].includes(position) || !eb_experience || !resume_url.startsWith('executive-board/')) {
        return NextResponse.json({ message: 'Please complete the Executive Board fields and attach a resume.' }, { status: 400 });
      }
      application = { ...application, committee, position, eb_experience, resume_url };
    } else {
      const department = text(body.department, 80);
      if (!departments.includes(department)) return NextResponse.json({ message: 'Choose a valid department.' }, { status: 400 });
      application = { ...application, department };
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey || url.includes('placeholder')) {
      return NextResponse.json({ message: 'Applications are not configured yet.' }, { status: 503 });
    }

    const { error } = await createClient(url, serviceRoleKey).from(kind as Kind).insert({ ...application, status: 'pending' });
    if (error) {
      console.error('Supabase insert failed:', error);
      return NextResponse.json({ message: 'We could not save your application. Please try again.' }, { status: 502 });
    }

    const label = kind === 'executive_board' ? 'Executive Board' : kind === 'organizing_committee' ? 'Organizing Committee' : 'Delegate';
    try {
      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(process.env.FORM_SUBMIT_EMAIL || 'amoghmasna@gmail.com')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: `New Reimei MUN ${label} Application - ${full_name}`, _captcha: 'false', 'Application Type': label, ...application })
      });
    } catch (notificationError) {
      console.error('Application saved but notification failed:', notificationError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Application API error:', error);
    return NextResponse.json({ message: 'Server processing error.' }, { status: 500 });
  }
}
