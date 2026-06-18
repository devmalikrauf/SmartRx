'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchHistory();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/prescriptions');
      if (!res.ok) {
        throw new Error('Failed to fetch history');
      }
      const data = await res.json();
      if (data.success) {
        setPrescriptions(data.prescriptions);
      } else {
        toast.error(data.error || 'Could not load your history.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load prescription history.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (prescription) => {
    // Gracefully handle both root-level fields and nested extractedData fields
    const medicines = prescription.extractedData?.medicines || prescription.medicines || [];
    const tests = prescription.extractedData?.tests || prescription.tests || [];
    const ultrasounds = prescription.extractedData?.ultrasounds || prescription.ultrasounds || [];
    const precautions = prescription.extractedData?.precautions || prescription.precautions || [];
    const confidence_score = prescription.extractedData?.confidence_score || prescription.confidence_score || 100;
    const is_blurry = prescription.extractedData?.is_blurry || prescription.is_blurry || false;

    const formattedData = {
      success: true,
      imageUrl: prescription.imageUrl,
      medicines,
      tests,
      ultrasounds,
      precautions,
      confidence_score,
      is_blurry,
    };

    localStorage.setItem('prescriptionData', JSON.stringify(formattedData));
    router.push('/results');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-brand-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-gray-500 text-sm">Loading your prescription history...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Sign In Required</h2>
          <p className="text-sm text-gray-500 mt-2 mb-6">
            Log in to your account to save scans and view your prescription history.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition duration-150 text-center"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="inline-block border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition duration-150 text-center"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Prescription History
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View, inspect, and consult your past prescription scans.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
          >
            + Scan New
          </Link>
        </div>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">No Prescriptions Found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            You haven't scanned any prescriptions yet. Go back to the home screen and upload one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prescriptions.map((item) => {
            const medCount = item.extractedData?.medicines?.length || item.medicines?.length || 0;
            const testCount = item.extractedData?.tests?.length || item.tests?.length || 0;
            const ultraCount = item.extractedData?.ultrasounds?.length || item.ultrasounds?.length || 0;
            const precCount = item.extractedData?.precautions?.length || item.precautions?.length || 0;

            return (
              <div
                key={item._id}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition duration-200"
              >
                <div>
                  {/* Thumbnail Preview */}
                  <div className="h-40 bg-gray-100 overflow-hidden relative border-b border-gray-150">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt="Prescription Scan"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-brand-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                      {medCount} Medicines
                    </div>
                  </div>

                  <div className="p-5">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                      Scanned on
                    </span>
                    <span className="text-sm font-medium text-gray-700 block mt-0.5 font-sans">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {/* Summary of Items */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {testCount > 0 && (
                        <span className="bg-teal-50 text-[#0F766E] text-xs font-semibold px-2 py-1 rounded-md">
                          {testCount} Tests
                        </span>
                      )}
                      {ultraCount > 0 && (
                        <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded-md">
                          {ultraCount} Ultrasounds
                        </span>
                      )}
                      {precCount > 0 && (
                        <span className="bg-amber-50 text-amber-800 text-xs font-semibold px-2 py-1 rounded-md">
                          {precCount} Precautions
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleViewDetails(item)}
                    className="w-full text-center bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold py-2 rounded-xl hover:bg-brand-600 hover:text-white hover:border-brand-600 transition duration-150"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
