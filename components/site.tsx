'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [open, setOpen] = useState(false);
  const links: [string, string][] = [
    ['Home', '/'],
    ['Committees', '/committees'],
    ['Apply', '/apply'],
    ['Contact', '/#contact']
  ];

  return (
    <header className="absolute z-20 w-full border-b border-gold/20 bg-black/40 backdrop-blur-md">
      <nav className="container-page flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-display tracking-[.22em] text-gold text-lg">
          <Image
            src="/reimei-crest.jpg"
            alt="Reimei MUN crest"
            width={35}
            height={44}
            className="h-10 w-8 object-cover object-center rounded border border-gold/40"
          />
          REIMEI MUN
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          {links.map(([name, href]) => (
            <Link key={name} href={href} className="text-xs uppercase tracking-[.2em] font-semibold text-ivory/80 hover:text-gold transition-colors">
              {name}
            </Link>
          ))}
          <Link href="/apply" className="btn-primary !px-5 !py-2.5">
            Apply Now
          </Link>
        </div>
        <button className="md:hidden text-gold" onClick={() => setOpen(!open)} aria-label="Toggle Menu">
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      {open && (
        <div className="glass px-5 pb-4 md:hidden">
          {links.map(([name, href]) => (
            <Link key={name} href={href} onClick={() => setOpen(false)} className="block border-b border-gold/20 py-3 text-ivory">
              {name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-gold/20 py-10 bg-black/50">
      <div className="container-page flex flex-col justify-between gap-4 text-sm text-ivory/60 sm:flex-row">
        <span className="font-display tracking-[.2em] text-gold">REIMEI MUN</span>
        <span>
          &copy; {new Date().getFullYear()} Reimei MUN &bull;{' '}
          <Link className="hover:text-gold transition-colors" href="/admin/login">
            Admin Access
          </Link>
        </span>
      </div>
    </footer>
  );
}

export function Title({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return (
    <div className="max-w-3xl">
      <p className="mb-3 text-xs font-bold uppercase tracking-[.28em] text-gold">{eyebrow}</p>
      <h1 className="font-display text-4xl leading-tight sm:text-6xl text-gold drop-shadow-md">{title}</h1>
      <div className="gold-divider" />
      {copy && <p className="mt-4 text-base leading-7 text-ivory/80 font-light">{copy}</p>}
    </div>
  );
}
