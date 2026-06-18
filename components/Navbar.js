import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-150 h-16 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-2">
        {/* Heart logo or brand icon */}
        <span className="text-brand-600 text-2xl font-bold">SmartRx</span>
      </div>
      
      <div className="flex items-center gap-6">
        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition">
          Home
        </Link>
        <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition">
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
