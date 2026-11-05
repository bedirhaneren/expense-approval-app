import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ICON_FONT_URL } from '@/components/ui/icon';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'latin-ext'],
});

export const metadata: Metadata = {
  title: 'Masraf Bildirim',
  description: 'Masraf bildirim ve onay uygulaması',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Material Symbols is not available through next/font. */}
        <link rel="stylesheet" href={ICON_FONT_URL} />
      </head>
      <body className="min-h-full font-sans text-sm">{children}</body>
    </html>
  );
}
