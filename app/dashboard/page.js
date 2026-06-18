export default function Dashboard() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Prescription History
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View, inspect and query all your previous prescription scans.
          </p>
        </div>
      </div>

      {/* History Grid / List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center text-gray-500 italic">
        No prescriptions found. Upload one on the home screen to get started.
      </div>
    </div>
  );
}
