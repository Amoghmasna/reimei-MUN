import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Reimei MUN | Shaping Diplomacy', template: '%s | Reimei MUN' },
  description: 'Reimei Model United Nations - shaping diplomacy and inspiring leadership.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
