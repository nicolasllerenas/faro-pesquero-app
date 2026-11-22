import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Faro Pesquero - Detector Acústico de Aves Marinas | Chorrillos',
  description:
    'Aplicación de detección acústica de aves marinas (Piquero, Pelícano, Gaviota) para pescadores artesanales del distrito de Chorrillos con modelo Edge Impulse.',
  applicationName: 'Faro Pesquero',
  authors: [{ name: 'Faro Pesquero - Chorrillos' }]
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#061427'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
