import { Header, Footer, Title } from '@/components/site';
import Link from 'next/link';
import { Users, Landmark, BriefcaseBusiness } from 'lucide-react';

const roles = [
  [
    'Delegate Registration',
    'Represent a nation, negotiate resolutions and speak on the global stage.',
    '/apply/delegate',
    Users
  ],
  [
    'Executive Board Registration',
    'Lead deliberations and shape an exceptional committee experience.',
    '/apply/executive-board',
    Landmark
  ],
  [
    'Organizing Committee Registration',
    'Build the conference behind the scenes with our secretariat.',
    '/apply/organizing-committee',
    BriefcaseBusiness
  ]
] as const;

export const metadata = { title: 'Apply' };

export default function Apply() {
  return (
    <>
      <Header />
      <main className="container-page pt-36 pb-24">
        <Title
          eyebrow="Applications"
          title="Take your seat at Reimei."
          copy="Select the role through which you want to make an impact."
        />
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {roles.map(([title, desc, href, Icon]) => (
            <article key={title} className="glass flex min-h-72 flex-col p-8">
              <Icon className="text-gold" />
              <h2 className="mt-8 font-display text-2xl">{title}</h2>
              <p className="mt-4 flex-1 text-sm text-ivory/60">{desc}</p>
              <Link className="mt-8 text-xs uppercase tracking-widest text-gold" href={href}>
                Begin application &rarr;
              </Link>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
