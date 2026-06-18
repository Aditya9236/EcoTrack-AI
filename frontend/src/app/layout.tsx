import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EcoTrack AI — Carbon Footprint Awareness Platform',
  description:
    'Understand, track, and reduce your carbon footprint through simple actions and personalized AI-powered insights. Join students, professionals, and eco-conscious individuals worldwide.',
  keywords: ['carbon footprint', 'sustainability', 'climate', 'eco', 'green', 'AI'],
  authors: [{ name: 'EcoTrack AI Team' }],
  openGraph: {
    title: 'EcoTrack AI — Carbon Footprint Awareness Platform',
    description: 'AI-powered carbon tracking, gamified habits, and personalized sustainability coaching.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body className="antialiased bg-[#080F0D] text-white min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
