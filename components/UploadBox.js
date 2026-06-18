'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

export default function UploadBox({ onUpload }) {
  // When a file is dropped or selected, call the onUpload handler
  const onDrop = useCallback(
    (acceptedFiles, fileRejections) => {
      if (fileRejections && fileRejections.length > 0) {
        const fileErr = fileRejections[0];
        if (fileErr.errors && fileErr.errors[0]) {
          // If file is too large or wrong format
          toast.error(`Upload error: ${fileErr.errors[0].message}. Please upload a JPG, PNG, WEBP, or PDF.`);
        } else {
          toast.error('Invalid file type. Please upload a JPG, PNG, WEBP, or PDF.');
        }
        return;
      }
      if (acceptedFiles.length > 0 && onUpload) {
        onUpload(acceptedFiles[0]);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer bg-white transition-colors ${
        isDragActive ? 'border-[#0F766E] bg-teal-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Upload Icon */}
        <div className="text-[#0F766E]">
          <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>

        <div>
          <p className="text-base font-semibold text-gray-700">
            {isDragActive ? 'Drop your prescription here' : 'Upload Prescription'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Drag and drop an image or PDF, or click to browse
          </p>
        </div>

        <p className="text-xs text-gray-300">
          Supports JPG, PNG, WEBP, PDF
        </p>
      </div>
    </div>
  );
}
