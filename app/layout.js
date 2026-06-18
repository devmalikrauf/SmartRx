import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'SmartRx - AI Prescription Assistant',
  description: 'AI-powered prescription reading, extraction, and assistant.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-brand-100">
        <Toaster position="top-right" />
        <Navbar />
        <main className="min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </body>
    </html>
  );
}

