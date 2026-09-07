import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { BottomNav } from '@/components/bottom-nav';
const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = { title: 'StudyHub', description: 'Structured course notes', manifest: '/manifest.json' };
export const viewport: Viewport = { themeColor: '#3B82F6' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body className={inter.className}><main className="mx-auto min-h-dvh max-w-5xl pb-24 md:pb-8">{children}</main><BottomNav /></body></html>; }
