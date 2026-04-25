import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Kiker's movies",
  description: 'Premium secure video streaming platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
