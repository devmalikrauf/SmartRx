'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-150 h-16 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-brand-600 text-2xl font-bold tracking-tight flex items-center gap-1.5 hover:opacity-95 transition">
          <svg className="w-6 h-6 text-brand-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          SmartRx
        </Link>
      </div>
      
      <div className="flex items-center gap-6">
        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition">
          Home
        </Link>
        {status === 'authenticated' ? (
          <>
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition">
              Dashboard
            </Link>
            <span className="text-sm text-gray-400">|</span>
            <span className="text-sm font-semibold text-gray-700">Hi, {session.user.name ? session.user.name.split(' ')[0] : 'User'}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm font-medium text-red-600 hover:text-red-700 transition"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-xl transition duration-150"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
