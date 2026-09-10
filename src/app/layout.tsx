import type { Metadata } from 'next';
import { Inter, Geist_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'vietnamese'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'threejs-showcase — Lộ trình học Three.js & Web 3D',
  description:
    '38 bài tập Three.js và React Three Fiber từ cơ bản đến nâng cao, chuẩn bị phỏng vấn Front-End Web 3D Developer.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      data-focus-visible-mode="keyboard"
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
