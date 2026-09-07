'use client';
import Link from 'next/link';
import { Bot, Home, Search, UserRound } from 'lucide-react';
import { usePathname } from 'next/navigation';
const items = [{ href: '/', label: 'Home', Icon: Home }, { href: '/search', label: 'Search', Icon: Search }, { href: '/ai', label: 'AI', Icon: Bot }, { href: '/account', label: 'Account', Icon: UserRound }];
export function BottomNav() { const path = usePathname(); return <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"><div className="mx-auto flex max-w-md justify-around">{items.map(({ href, label, Icon }) => <Link key={href} href={href} className={`flex min-h-14 min-w-16 flex-col items-center justify-center gap-1 text-xs ${path === href ? 'text-primary' : 'text-muted'}`}><Icon size={21} aria-hidden /><span>{label}</span></Link>)}</div></nav>; }
