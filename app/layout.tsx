import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { tweetBot } from '@/services/tweetBot';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CipherX Twitter Bot',
  description: 'Next-gen crypto insights automation',
};

if (typeof window !== 'undefined') {
  tweetBot.start();
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="modern" className="dark">
      <body className={`${inter.className} bg-base-100 text-base-content antialiased`}>
        <div className="min-h-screen relative overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-base-100 via-base-200 to-base-300 opacity-50" />
          
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-gradient" />
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-secondary/10 to-transparent rounded-full blur-3xl animate-gradient" />
          </div>
          
          {/* Content */}
          <div className="relative">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
