'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { committees, departments } from '@/lib/constants';

type Kind = 'delegates' | 'executive_board' | 'organizing_committee';

const kindLabels: Record<Kind, string> = {
  delegates: 'Delegate',
  executive_board: 'Executive Board',
  organizing_committee: 'Organizing Committee'
};

export function ApplicationForm({ kind }: { kind: Kind }) {
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

    try {
      const form = e.currentTarget;
      const f = new FormData(form);
      const rawValues = Object.fromEntries(f.entries());

      const payload = {
        _subject: `New Reimei MUN ${kindLabels[kind]} Application - ${rawValues.full_name || 'Applicant'}`,
        _captcha: 'false',
        'Application Type': kindLabels[kind],
        'Full Name': rawValues.full_name || 'N/A',
        Email: rawValues.email || 'N/A',
        Phone: rawValues.phone || 'N/A',
        Age: rawValues.age || 'N/A',
        Institution: rawValues.institution || 'N/A',
        Grade: rawValues.grade || 'N/A',
        Committee: rawValues.committee || 'N/A',
        Position: rawValues.position || 'N/A',
        Department: rawValues.department || 'N/A',
        'Preference 1': rawValues.preference_1 || 'N/A',
        'Preference 2': rawValues.preference_2 || 'N/A',
        'Preference 3': rawValues.preference_3 || 'N/A',
        Experience: rawValues.experience || 'N/A',
        'EB Experience': rawValues.eb_experience || 'N/A'
      };

      // Direct email dispatch to amoghmasna@gmail.com
      const res = await fetch('https://formsubmit.co/ajax/amoghmasna@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Also attempt backend API if available
      try {
        await fetch('/api/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind, ...rawValues })
        });
      } catch (backendErr) {
        console.warn('Backend API notification skipped:', backendErr);
      }

      if (!res.ok) {
        throw new Error('Failed to send application. Please check your internet connection.');
      }

      setBusy(false);
      setSuccess(true);
    } catch (err: any) {
      console.error('Submission Error:', err);
      setMessage(err?.message || 'Failed to submit application. Please try again.');
      setBusy(false);
    }
  }

  if (success) {
    return (
      <div className="glass mx-auto max-w-2xl p-10 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold/20 text-gold text-3xl">
          ✓
        </div>
        <h2 className="font-display text-3xl text-gold">Application Submitted Successfully!</h2>
        <p className="mt-4 text-base text-ivory/90 leading-relaxed">
          Thank you for applying to Reimei MUN! Your application details have been recorded and an email notification with all details has been sent to <strong>amoghmasna@gmail.com</strong>.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            router.push('/apply');
          }}
          className="btn-primary mt-8"
        >
          Submit Another Application
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
      <div className="grid gap-5 sm:grid-cols-2">
        <Input name="full_name" label="Full name" />
        <Input name="age" label="Age" type="number" />
        <Input name="institution" label="School / institution" />
        <Input name="grade" label="Grade / class" required={!exec && !org} />
        <Input name="phone" label="Phone number" type="tel" />
        <Input name="email" label="Email address" type="email" />

        {/* Delegate Preferences */}
        {kind === 'delegates' && (
          <>
            <Select name="preference_1" label="First Preference Committee" options={committees} />
            <Select name="preference_2" label="Second Preference Committee" options={committees} />
            <Select name="preference_3" label="Third Preference Committee" options={committees} />
          </>
        )}

        {/* Executive Board Fields */}
        {exec && (
          <>
            <Select name="committee" label="Preferred Committee" options={committees} />
            <Select name="position" label="Position" options={['Chair', 'Vice Chair', 'Rapporteur']} />
            <label className="label block sm:col-span-2">
              Prior Executive Board Experience
              <textarea name="eb_experience" required className="field min-h-24" />
            </label>
          </>
        )}

        {/* Organizing Committee Fields */}
        {org && <Select name="department" label="Department" options={departments} />}

        <label className="label block sm:col-span-2">
          {org ? 'Relevant Experience' : 'Previous MUN Experience'}
          <textarea name="experience" required className="field min-h-28" />
        </label>
      </div>

      {message && <p className="mt-5 text-sm text-red-400 font-semibold">{message}</p>}

      <div className="mt-8">
        <button type="submit" disabled={busy} className="btn-primary w-full sm:w-auto">
          {busy ? 'Submitting Application...' : 'Submit Application'}
        </button>
      </div>
    </form>
  );
}
