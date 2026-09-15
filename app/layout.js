import './globals.css';
import { DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });

export const metadata = {
  title: 'ApexPrep · Big Goals. Better AP Practice.',
  description: 'Work toward your AP goals with focused practice, clear explanations, and a calmer study space. Explore the free ApexPrep demo.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
