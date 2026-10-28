'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bricolage_Grotesque,
  Chakra_Petch,
  Familjen_Grotesk,
  Geist,
  IBM_Plex_Mono,
  Share_Tech_Mono,
} from 'next/font/google';

const mono = IBM_Plex_Mono({ weight: '400', subsets: ['latin'] });
const phosphor = Share_Tech_Mono({ weight: '400', subsets: ['latin'] });
const folio = Familjen_Grotesk({ weight: '500', subsets: ['latin'] });
const orbit = Chakra_Petch({ weight: '500', subsets: ['latin'] });
const stamp = Bricolage_Grotesque({ weight: '800', subsets: ['latin'] });
const keynote = Geist({ subsets: ['latin'] });

const studies = [
  {
    href: '/design/1',
    name: 'Phosphor',
    concept: 'A root shell that audits the page in plain sight.',
    face: phosphor.className,
    rest: mono.className,
  },
  {
    href: '/design/2',
    name: 'Folio',
    concept: 'A Swiss sheet where the score is the headline.',
    face: folio.className,
    rest: folio.className,
  },
  {
    href: '/design/3',
    name: 'Orbit',
    concept: 'Mission control for a page under scan.',
    face: orbit.className,
    rest: orbit.className,
  },
  {
    href: '/design/4',
    name: 'Stamp',
    concept: 'Loud tickets for quiet accessibility bugs.',
    face: stamp.className,
    rest: stamp.className,
  },
  {
    href: '/design/5',
    name: 'Keynote',
    concept: 'One number, then the fix.',
    face: keynote.className,
    rest: keynote.className,
  },
];

export default class DesignsIndex extends React.Component {
  componentDidMount() {
    document.title = 'Designs — FixIt';
    document.body.style.background = '#f5f4f1';
    document.body.style.color = '#161616';
  }

  componentWillUnmount() {
    document.body.style.background = '';
    document.body.style.color = '';
  }

  render() {
    return (
      <main className="min-h-screen bg-[#f5f4f1] text-[#161616]">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <header className="flex items-baseline justify-between gap-6">
            <h1 className={`${folio.className} text-5xl tracking-[-0.04em]`}>Designs</h1>
            <Link href="/" className={`${mono.className} text-sm`}>
              Home
            </Link>
          </header>
          <p className={`${folio.className} mt-4 max-w-md text-lg leading-snug`}>
            Five working audits. Same flow, five different rooms.
          </p>
          <ol className="mt-12 border-t border-[#161616]">
            {studies.map((study, index) => (
              <li key={study.href} className="border-b border-[#161616]">
                <Link href={study.href} className="group grid gap-2 py-7 sm:grid-cols-[4rem_minmax(0,1fr)] sm:items-baseline">
                  <span className={`${mono.className} text-sm`}>0{index + 1}</span>
                  <span>
                    <span className={`${study.face} block text-4xl tracking-[-0.04em] group-hover:underline`}>{study.name}</span>
                    <span className={`${study.rest} mt-2 block text-base leading-snug text-[#3f3a32]`}>{study.concept}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </main>
    );
  }
}
