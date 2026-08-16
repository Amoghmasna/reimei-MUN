'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { committees, departments } from '@/lib/constants';

type Kind = 'delegates' | 'executive_board' | 'organizing_committee';

export function ApplicationForm({ kind }: { kind: Kind }) {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const exec = kind === 'executive_board';
  const org = kind === 'organizing_committee';

  async function submit(f: FormData) {
    setBusy(true);
    setMessage('');
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

    const values = Object.fromEntries(f.entries());
    delete values.resume;

    // Convert age to integer to match SQL schema
    if (values.age) {
      values.age = parseInt(String(values.age), 10) as any;
    }

    const { error } = await db.from(kind).insert({
      ...values,
      ...(resume_url ? { resume_url } : {}),
      status: 'pending'
    });

    if (error) {
      setMessage(error.message);
      setBusy(false);
      return;
    }

    router.push('/apply?success=1');
  }

  const handleNextStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    const form = e.currentTarget.closest('form');
    if (form) {
      // Validate step 1 fields before advancing
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
    <form action={submit} className="glass mx-auto max-w-3xl p-6 sm:p-10">
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
          <button disabled={busy} className="btn-primary">
            {busy ? 'Submitting...' : 'Submit application'}
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
