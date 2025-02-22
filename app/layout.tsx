import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { tweetBot } from '@/services/tweetBot';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CipherX TweetBot',
  description: 'Automated crypto market insights and analysis',
};

// Only start the bot on the client side
if (typeof window !== 'undefined') {
  // Use setTimeout to ensure this runs after hydration
  setTimeout(() => {
    tweetBot.start();
  }, 0);
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
