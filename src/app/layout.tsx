import './globals.css';
import { ReactNode } from 'react';
import Script from 'next/script';
import { RootProvider } from '@/components/RootProvider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="03de73e5-1986-4cf7-9707-7627b5c59b01"
        />
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}