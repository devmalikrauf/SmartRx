'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatBox from '@/components/ChatBox';

export default function Results() {
  const router = useRouter();
  const [data, setData] = useState(null);

  // Load prescription data from localStorage when the page loads
  useEffect(() => {
    const stored = localStorage.getItem('prescriptionData');
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      // If no data found, redirect back to home page
      router.push('/');
    }
  }, [router]);

  // Show loading state while data is being read
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500 text-sm">Loading prescription data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prescription Analysis</h1>
            <p className="text-sm text-gray-500 mt-1">
              Here's what our AI extracted from your prescription.
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-sm font-medium text-[#0F766E] border border-[#0F766E] px-4 py-2 rounded-xl hover:bg-teal-50"
          >
            ← Upload Another
          </button>
        </div>
      </div>

      {/* Main Content — Two Column Layout */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left Column — Prescription Details (3/5 width) */}
          <div className="lg:col-span-3 space-y-6">

            {/* ── Medicines Section ───────────────────────────────── */}
            <div className="border border-gray-100 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <svg className="w-5 h-5 text-[#0F766E]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">Medicines</h2>
              </div>

              {data.medicines && data.medicines.length > 0 ? (
                <div className="space-y-4">
                  {data.medicines.map((med, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      {/* Medicine Name */}
                      <h3 className="text-base font-semibold text-gray-900">{med.name}</h3>

                      {/* Medicine Details Grid */}
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {med.dosage && (
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Dosage</p>
                            <p className="text-sm text-gray-700 mt-0.5">{med.dosage}</p>
                          </div>
                        )}
                        {med.frequency && (
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Frequency</p>
                            <p className="text-sm text-gray-700 mt-0.5">{med.frequency}</p>
                          </div>
                        )}
                        {med.duration && (
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Duration</p>
                            <p className="text-sm text-gray-700 mt-0.5">{med.duration}</p>
                          </div>
                        )}
                        {med.instructions && (
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Instructions</p>
                            <p className="text-sm text-gray-700 mt-0.5">{med.instructions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No medicines found on this prescription.</p>
              )}
            </div>

            {/* ── Tests Section ───────────────────────────────────── */}
            <div className="border border-gray-100 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <svg className="w-5 h-5 text-[#0F766E]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">Recommended Tests</h2>
              </div>

              {data.tests && data.tests.length > 0 ? (
                <ul className="space-y-2">
                  {data.tests.map((test, index) => (
                    <li key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                      <span className="w-6 h-6 rounded-full bg-[#0F766E] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700">{test}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic">No tests recommended on this prescription.</p>
              )}
            </div>

            {/* ── Ultrasounds Section ─────────────────────────────── */}
            <div className="border border-gray-100 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <svg className="w-5 h-5 text-[#0F766E]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">Ultrasounds</h2>
              </div>

              {data.ultrasounds && data.ultrasounds.length > 0 ? (
                <ul className="space-y-2">
                  {data.ultrasounds.map((scan, index) => (
                    <li key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                      <span className="w-6 h-6 rounded-full bg-[#0F766E] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700">{scan}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic">No ultrasounds recommended on this prescription.</p>
              )}
            </div>

            {/* ── Precautions Section ─────────────────────────────── */}
            <div className="border border-gray-100 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <svg className="w-5 h-5 text-[#0F766E]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">Precautions</h2>
              </div>

              {data.precautions && data.precautions.length > 0 ? (
                <ul className="space-y-2">
                  {data.precautions.map((precaution, index) => (
                    <li key={index} className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                      <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.007v.008H12v-.008zM21.721 12.752c0 5.385-4.365 9.75-9.75 9.75s-9.75-4.365-9.75-9.75 4.365-9.75 9.75-9.75 9.75 4.365 9.75 9.75z" />
                      </svg>
                      <span className="text-sm text-amber-900">{precaution}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic">No precautions mentioned on this prescription.</p>
              )}
            </div>
          </div>

          {/* Right Column — AI Chat Assistant (2/5 width) */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 h-fit">
            <ChatBox prescriptionData={data} />
          </div>

        </div>
      </div>
    </div>
  );
}
