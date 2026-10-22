import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProofPath — Know what changed. See the proof.',
  description: 'Evidence-first comparison of two versions of hackathon rules.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
