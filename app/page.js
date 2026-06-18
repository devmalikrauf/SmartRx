'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import UploadBox from '@/components/UploadBox';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Handles the full upload → analyze → redirect flow
  async function handleUpload(file) {
    setLoading(true);
    toast.loading('Uploading prescription...', { id: 'upload-toast' });
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Step 1: Upload the image/PDF to Cloudinary
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadRes.ok) {
        throw new Error('Upload to server failed.');
      }
      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        throw new Error(uploadData.error || 'Failed to upload image.');
      }
      const { url } = uploadData;

      // Step 2: Send the Cloudinary URL to Gemini AI for analysis
      toast.loading('AI is analyzing prescription...', { id: 'upload-toast' });
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url }),
      });
      if (!analyzeRes.ok) {
        throw new Error('AI Analysis server request failed.');
      }
      const data = await analyzeRes.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze prescription.');
      }

      // Step 3: Store results in localStorage and navigate to results page
      localStorage.setItem('prescriptionData', JSON.stringify(data));
      toast.success('Prescription analyzed successfully!', { id: 'upload-toast' });
      router.push('/results');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Something went wrong during analysis.', { id: 'upload-toast' });
      setLoading(false);
    }
  }


  // ── Loading Overlay ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="flex items-center gap-3 mb-4">
          <svg
            className="animate-spin h-5 w-5 text-[#0F766E]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-lg font-semibold text-gray-900">
            AI is analyzing your prescription...
          </span>
        </div>
        <p className="text-sm text-gray-500">
          This usually takes under 30 seconds.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white">

      {/* ════════════════════════════════════════════════════════════
          SECTION 1 — Hero
          ════════════════════════════════════════════════════════════ */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
          Your Prescription, Explained.
        </h1>

        <p className="mt-5 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Upload your doctor's prescription and instantly get a clear breakdown
          of your medicines, tests, and instructions — powered by AI.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          {/* Primary CTA — scrolls to upload section */}
          <a
            href="#upload"
            className="inline-block bg-[#0F766E] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#0d6b63]"
          >
            Scan Prescription
          </a>

          {/* Secondary ghost CTA — scrolls to how-it-works */}
          <a
            href="#how-it-works"
            className="inline-block border border-gray-200 text-gray-700 text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-50"
          >
            See How It Works
          </a>
        </div>
      </section>

      {/* Subtle divider */}
      <div className="border-t border-gray-100" />

      {/* ════════════════════════════════════════════════════════════
          SECTION 2 — How It Works
          ════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
          Three steps. That's all.
        </h2>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Step 1 — Upload */}
          <div className="border border-gray-100 rounded-xl p-6">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Step 1
            </span>

            {/* Upload / document icon */}
            <div className="mt-4 text-[#0F766E]">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>

            <h3 className="mt-4 text-base font-semibold text-gray-900">
              Upload Your Prescription
            </h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Take a photo or upload a PDF of your doctor's prescription.
            </p>
          </div>

          {/* Step 2 — Extract */}
          <div className="border border-gray-100 rounded-xl p-6">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Step 2
            </span>

            {/* Sparkle / scan icon */}
            <div className="mt-4 text-[#0F766E]">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>

            <h3 className="mt-4 text-base font-semibold text-gray-900">
              AI Reads It Instantly
            </h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Our AI identifies every medicine, dosage, test, and precaution.
            </p>
          </div>

          {/* Step 3 — Understand */}
          <div className="border border-gray-100 rounded-xl p-6">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Step 3
            </span>

            {/* Chat bubble icon */}
            <div className="mt-4 text-[#0F766E]">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>

            <h3 className="mt-4 text-base font-semibold text-gray-900">
              Ask Anything
            </h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Chat with our AI assistant to understand your prescription in plain language.
            </p>
          </div>
        </div>
      </section>

      {/* Subtle divider */}
      <div className="border-t border-gray-100" />

      {/* ════════════════════════════════════════════════════════════
          SECTION 3 — Features
          ════════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
          Everything you need to understand your prescription
        </h2>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Card 1 — Medicine Breakdown */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <span className="text-[#0F766E]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </span>
              <h3 className="text-base font-semibold text-gray-900">Medicine Breakdown</h3>
            </div>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              See every medicine with its exact dosage, frequency, and how to take it.
            </p>
          </div>

          {/* Card 2 — Tests & Scans */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <span className="text-[#0F766E]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </span>
              <h3 className="text-base font-semibold text-gray-900">Tests &amp; Scans</h3>
            </div>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              Know exactly which tests or ultrasounds your doctor has recommended.
            </p>
          </div>

          {/* Card 3 — AI Chat Assistant */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <span className="text-[#0F766E]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </span>
              <h3 className="text-base font-semibold text-gray-900">AI Chat Assistant</h3>
            </div>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              Ask questions about any medicine or test — get clear, simple answers.
            </p>
          </div>

          {/* Card 4 — Prescription History */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <span className="text-[#0F766E]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <h3 className="text-base font-semibold text-gray-900">Prescription History</h3>
            </div>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              All your past prescriptions saved securely in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Subtle divider */}
      <div className="border-t border-gray-100" />

      {/* ════════════════════════════════════════════════════════════
          SECTION 4 — Upload CTA
          ════════════════════════════════════════════════════════════ */}
      <section id="upload" className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Ready to understand your prescription?
        </h2>
        <p className="mt-3 text-base text-gray-500">
          Upload a photo or PDF — results in under 30 seconds.
        </p>

        {/* Upload Component */}
        <div className="mt-10">
          <UploadBox onUpload={handleUpload} />
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Your prescription data is private and secure.
        </p>
      </section>
    </div>
  );
}
