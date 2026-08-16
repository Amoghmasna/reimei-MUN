'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import * as XLSX from 'xlsx';

type Row = {
  id: string;
  full_name: string;
  email: string;
  status: string;
  created_at: string;
  resume_url?: string;
  [k: string]: unknown;
};

type Table = 'delegates' | 'executive_board' | 'organizing_committee';

const labels: Record<Table, string> = {
  delegates: 'Delegate Applications',
  executive_board: 'Executive Board Applications',
  organizing_committee: 'Organizing Committee Applications'
};

export default function Admin() {
  const [table, setTable] = useState<Table>('delegates');
  const [rows, setRows] = useState<Row[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    const db = supabase();
    const tables = Object.keys(labels) as Table[];
    const c: Record<string, number> = {};
    for (const t of tables) {
      const r = await db
        .from(t)
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
      if (t === table) setRows((r.data || []) as Row[]);
      c[t] = r.count || 0;
    }
    setCounts(c);
  }, [table]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!q ||
            r.full_name.toLowerCase().includes(q.toLowerCase()) ||
            r.email.toLowerCase().includes(q.toLowerCase())) &&
          (!status || r.status === status)
      ),
    [rows, q, status]
  );

  async function setState(id: string, v: string) {
    const db = supabase();
    await db.from(table).update({ status: v }).eq('id', id);
    load();
  }

  async function openResume(resumePath: string) {
    const db = supabase();
    const { data } = await db.storage.from('resumes').createSignedUrl(resumePath, 3600);
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    } else {
      const publicUrl = db.storage.from('resumes').getPublicUrl(resumePath).data.publicUrl;
      window.open(publicUrl, '_blank');
    }
  }

  async function handleSignOut() {
    const db = supabase();
    await db.auth.signOut();
    window.location.href = '/admin/login';
  }

  function download(excel = false) {
    const data = visible.map(({ id, ...r }) => r);
    if (excel) {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, table);
      XLSX.writeFile(wb, `reimei-${table}.xlsx`);
    } else {
      const csv = [
        Object.keys(data[0] || {}).join(','),
        ...data.map((x) => Object.values(x).map((v) => JSON.stringify(v ?? '')).join(','))
      ].join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = `reimei-${table}.csv`;
      a.click();
    }
  }

  return (
    <main className="min-h-screen p-5 sm:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="font-display tracking-[.18em] text-gold">REIMEI MUN</p>
            <h1 className="mt-2 font-display text-3xl">Application command centre</h1>
          </div>
          <button onClick={handleSignOut} className="btn-ghost">
            Sign out
          </button>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Total', Object.values(counts).reduce((a, b) => a + b, 0)],
            ...Object.entries(labels).map(([k, v]) => [v, counts[k] || 0])
          ].map(([a, b]) => (
            <div className="glass p-5" key={String(a)}>
              <p className="text-xs uppercase tracking-widest text-ivory/55">{a}</p>
              <p className="mt-3 font-display text-3xl text-gold">{String(b)}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 glass p-5">
          <div className="flex flex-wrap gap-3">
            {(Object.keys(labels) as Table[]).map((t) => (
              <button
                onClick={() => setTable(t)}
                className={table === t ? 'btn-primary' : 'btn-ghost'}
                key={t}
              >
                {labels[t]}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <input
              className="field !mt-0 max-w-xs"
              placeholder="Search applicants"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="field !mt-0 w-40"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
              <option value="waitlisted">waitlisted</option>
            </select>
            <button onClick={() => download()} className="btn-ghost">
              CSV export
            </button>
            <button onClick={() => download(true)} className="btn-ghost">
              Excel export
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-widest text-ivory/50">
                <tr>
                  <th className="p-3">Applicant</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr className="border-b border-white/10" key={r.id}>
                    <td className="p-3 font-medium">{r.full_name}</td>
                    <td>{r.email}</td>
                    <td className="capitalize">{r.status}</td>
                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="space-x-2">
                      <button onClick={() => setState(r.id, 'approved')} className="text-gold">
                        Approve
                      </button>
                      <button onClick={() => setState(r.id, 'rejected')} className="text-red-300">
                        Reject
                      </button>
                      {table === 'delegates' && (
                        <button onClick={() => setState(r.id, 'waitlisted')} className="text-ivory/70">
                          Waitlist
                        </button>
                      )}
                      {table === 'executive_board' && r.resume_url && (
                        <button
                          onClick={() => openResume(String(r.resume_url))}
                          className="text-gold underline"
                        >
                          Resume
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
