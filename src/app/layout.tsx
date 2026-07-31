import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/chrome.css';
import '@/styles/story.css';
import '@/styles/pages.css';

import { SiteHeader } from '@/components/chrome/SiteHeader';
import { SiteFooter } from '@/components/chrome/SiteFooter';
import { ExperienceBoot } from '@/components/story/ExperienceBoot';
import { content } from '@/lib/content/repository';

const grotesk = Geist({
  subsets: ['latin'],
  variable: '--font-grotesk',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
});

const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono-grotesk',
  display: 'swap',
  weight: ['400', '500'],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await content.siteSettings();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: {
      default: settings.defaultSeoTitle,
      template: `%s — ${settings.brandName}`,
    },
    description: settings.defaultSeoDescription,
    applicationName: settings.brandName,
    openGraph: {
      type: 'website',
      siteName: settings.brandName,
      title: settings.defaultSeoTitle,
      description: settings.defaultSeoDescription,
    },
    twitter: { card: 'summary_large_image' },
    icons: { icon: '/brand/source/ag-logo.svg' },
  };
}

export const viewport: Viewport = {
  themeColor: '#070814',
  colorScheme: 'dark',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await content.siteSettings();

  return (
    <html lang="en" className={`${grotesk.variable} ${mono.variable}`}>
      <body>
        <a className="u-skip-link" href="#main">
          Skip to main content
        </a>
        <ExperienceBoot />
        <SiteHeader settings={settings} />
        {children}
        <SiteFooter settings={settings} />
      </body>
    </html>
  );
}
