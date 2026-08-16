'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { committees, departments } from '@/lib/constants';

type Kind = 'delegates' | 'executive_board' | 'organizing_committee';

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

    try {
      const form = e.currentTarget;
      const f = new FormData(form);
      const rawValues = Object.fromEntries(f.entries());

      // Parse age
      if (rawValues.age) {
        rawValues.age = (parseInt(String(rawValues.age), 10) || 0) as any;
      }

      delete rawValues.resume;

      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          kind,
          ...rawValues
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit application. Please try again.');
      }

      setBusy(false);
      setSuccess(true);
    } catch (err: any) {
      console.error('Submission error:', err);
      setMessage(err?.message || 'Something went wrong. Please check your inputs and try again.');
      setBusy(false);
    }
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
        <h2 className="font-display text-3xl text-gold">Application Submitted Successfully!</h2>
        <p className="mt-4 text-base text-ivory/90 leading-relaxed">
          Thank you for applying to Reimei MUN! Your application details have been recorded and an email notification with all details has been sent to <strong>amoghmasna@gmail.com</strong>.
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
        <p className="mb-7 text-xs uppercase tracking-widest text-gold font-bold">Step {step} of 2</p>
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

      {message && <p className="mt-5 text-sm text-red-400 font-semibold">{message}</p>}

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
