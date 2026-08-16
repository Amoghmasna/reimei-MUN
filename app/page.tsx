import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Mail } from 'lucide-react';
import { Header, Footer, Title } from '@/components/site';
import { Reveal } from '@/components/reveal';
import { committees, committeeInfo } from '@/lib/constants';

const Card = ({ c, i }: { c: (typeof committees)[number]; i: number }) => (
  <article className="glass group p-7 transition hover:-translate-y-1 hover:border-gold/80">
    <span className="text-xs font-bold tracking-[.2em] text-gold">0{i + 1}</span>
    <h3 className="mt-8 font-display text-2xl text-gold">{c}</h3>
    <p className="mt-3 min-h-12 text-sm text-ivory/80 leading-relaxed">{committeeInfo[c]}</p>
    <Link className="mt-7 inline-block text-xs font-bold uppercase tracking-widest text-gold hover:underline" href="/apply/delegate">
      Apply &rarr;
    </Link>
  </article>
);

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative flex min-h-screen items-center overflow-hidden">
          <Image
            src="/reimei-crest.jpg"
            alt=""
            fill
            priority
            className="pointer-events-none object-cover opacity-[.08] mix-blend-screen"
          />
          <div className="container-page relative pt-28 pb-16">
            <Reveal>
              <p className="mb-4 text-xs font-bold uppercase tracking-[.3em] text-gold">
                The Dawn of Diplomacy
              </p>
              <h1 className="font-display text-6xl leading-none sm:text-8xl text-gold drop-shadow-xl">
                REIMEI <span className="text-gold">MUN</span>
              </h1>
              <div className="gold-divider max-w-xl" />
              <p className="mt-5 max-w-xl text-xl text-ivory/90 font-light leading-relaxed">
                Shaping Diplomacy. Inspiring Leadership.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link className="btn-primary" href="/apply">
                  Apply Now <ArrowRight size={16} />
                </Link>
                <Link className="btn-ghost" href="/committees">
                  Explore Committees
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Mission Section */}
        <section className="container-page py-20">
          <Title
            eyebrow="Our Mission"
            title="Where Global Citizens Find Their Voice"
            copy="Reimei MUN is a forum for disciplined debate, intellectual curiosity and meaningful cooperation. We bring together tomorrow's diplomats to negotiate the ideas that shape our world."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              ['Diplomacy', 'Build consensus with integrity and poise.'],
              ['Leadership', 'Lead deliberations with conviction and empathy.'],
              ['Excellence', 'Research rigorously; advocate with clarity.']
            ].map(([title, desc]) => (
              <div className="glass p-8" key={title}>
                <h2 className="font-display text-xl text-gold">{title}</h2>
                <p className="mt-3 text-sm text-ivory/80 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Committees Section */}
        <section className="container-page py-20">
          <Title eyebrow="Councils & Committees" title="Enter The Chamber" />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {committees.map((c, i) => (
              <Card key={c} c={c} i={i} />
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="container-page py-20">
          <div className="glass p-9 sm:p-12">
            <Title
              eyebrow="Contact Us"
              title="Begin Your Reimei Chapter"
              copy="For partnerships, school delegations or general enquiries, our secretariat would be delighted to hear from you."
            />
            <a className="mt-7 flex items-center gap-3 text-base text-gold font-semibold hover:underline" href="mailto:hello@reimeimun.org">
              <Mail size={20} />
              hello@reimeimun.org
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

 
