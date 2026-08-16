'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { committees, departments } from '@/lib/constants';

type Kind = 'delegates' | 'executive_board' | 'organizing_committee';

const kindLabels: Record<Kind, string> = {
  delegates: 'Delegate',
  executive_board: 'Executive Board',
  organizing_committee: 'Organizing Committee'
};

export function ApplicationForm({ kind }: { kind: Kind }) {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const exec = kind === 'executive_board';
  const org = kind === 'organizing_committee';

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage('');

    const form = e.currentTarget;
    const f = new FormData(form);
    const db = supabase();
    let resume_url: string | undefined;

    const file = f.get('resume') as File | null;
    if (exec && file && file.size > 0) {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `${crypto.randomUUID()}-${sanitizedName}`;
      const up = await db.storage.from('resumes').upload(path, file);
      if (up.error) {
        setMessage(up.error.message);
        setBusy(false);
        return;
      }
      resume_url = up.data.path;
    }

    const rawValues = Object.fromEntries(f.entries());
    delete rawValues.resume;

    const payload: Record<string, unknown> = { ...rawValues };

    if (payload.age) {
      payload.age = parseInt(String(payload.age), 10) || 0;
    }

    // Insert into Supabase
    const { error: dbError } = await db.from(kind).insert({
      ...payload,
      ...(resume_url ? { resume_url } : {}),
      status: 'pending'
    });

    if (dbError) {
      console.error('Supabase DB Insert Error:', dbError);
      setMessage(dbError.message);
      setBusy(false);
      return;
    }

    // Dispatch Email Notification to amoghmasna@gmail.com
    try {
      await fetch('https://formsubmit.co/ajax/amoghmasna@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          _subject: `New ${kindLabels[kind]} Application - ${payload.full_name || 'Applicant'}`,
          _captcha: 'false',
          'Application Type': kindLabels[kind],
          'Full Name': payload.full_name,
          Email: payload.email,
          Phone: payload.phone,
          Age: payload.age,
          Institution: payload.institution,
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
      console.warn('Email notification dispatch warning:', emailErr);
    }

    setBusy(false);
    setSuccess(true);
  }

  const handleNextStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    const form = e.currentTarget.closest('form');
    if (form) {
      const inputs = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        '#step-1-fields [required]'
      );
      let isValid = true;
      inputs.forEach((input) => {
        if (!input.checkValidity()) {
          input.reportValidity();
          isValid = false;
        }
      });
      if (isValid) {
        setStep(2);
      }
    }
  };

  if (success) {
    return (
      <div className="glass mx-auto max-w-2xl p-10 text-center">
        <h2 className="font-display text-3xl text-gold">Application Submitted!</h2>
        <p className="mt-4 text-sm text-ivory/80">
          Thank you for applying to Reimei MUN. Your application details have been recorded and an email notification has been dispatched to <strong>amoghmasna@gmail.com</strong>.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setStep(1);
            router.push('/apply');
          }}
          className="btn-primary mt-8"
        >
          Return to Applications
        </button>
      </div>
    );
  }

  const Input = ({
    name,
    label,
    type = 'text',
    required = true
  }: {
    name: string;
    label: string;
    type?: string;
    required?: boolean;
  }) => (
    <label className="label block">
      {label}
      <input name={name} type={type} required={required} className="field" />
    </label>
  );

  const Select = ({
    name,
    label,
    options
  }: {
    name: string;
    label: string;
    options: readonly string[];
  }) => (
    <label className="label block">
      {label}
      <select name={name} required className="field">
        <option value="">Select an option</option>
        {options.map((x) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="glass mx-auto max-w-3xl p-6 sm:p-10">
      {kind === 'delegates' && (
        <p className="mb-7 text-xs uppercase tracking-widest text-gold">Step {step} of 2</p>
      )}

      {/* Step 1 Fields */}
      <div id="step-1-fields" className={step === 1 ? 'grid gap-5 sm:grid-cols-2' : 'hidden'}>
        <Input name="full_name" label="Full name" />
        <Input name="age" label="Age" type="number" />
        <Input name="institution" label="School / institution" />
        <Input name="grade" label="Grade / class" required={!exec && !org} />
        <Input name="phone" label="Phone number" type="tel" />
        <Input name="email" label="Email address" type="email" />
        <label className="label block sm:col-span-2">
          {org ? 'Relevant experience' : 'Previous MUN experience'}
          <textarea name="experience" required className="field min-h-28" />
        </label>
        {exec && (
          <>
            <label className="label block sm:col-span-2">
              Prior Executive Board experience
              <textarea name="eb_experience" required className="field min-h-24" />
            </label>
            <Select name="committee" label="Committee" options={committees} />
            <Select name="position" label="Position" options={['Chair', 'Vice Chair', 'Rapporteur']} />
            <label className="label block sm:col-span-2">
              Resume (PDF/DOCX)
              <input name="resume" type="file" accept=".pdf,.doc,.docx" required className="field" />
            </label>
          </>
        )}
        {org && <Select name="department" label="Department" options={departments} />}
      </div>

      {/* Step 2 Fields for Delegates */}
      {kind === 'delegates' && (
        <div id="step-2-fields" className={step === 2 ? 'grid gap-5 sm:grid-cols-2' : 'hidden'}>
          {['First Preference', 'Second Preference', 'Third Preference'].map((label, i) => (
            <Select key={label} name={`preference_${i + 1}`} label={label} options={committees} />
          ))}
        </div>
      )}

      {message && <p className="mt-5 text-sm text-red-300">{message}</p>}

      <div className="mt-8 flex gap-3">
        {kind === 'delegates' && step === 1 ? (
          <button type="button" onClick={handleNextStep} className="btn-primary">
            Continue
          </button>
        ) : (
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? 'Submitting Application...' : 'Submit Application'}
          </button>
        )}
        {kind === 'delegates' && step === 2 && (
          <button type="button" onClick={() => setStep(1)} className="btn-ghost">
            Back
          </button>
        )}
      </div>
    </form>
  );
}
