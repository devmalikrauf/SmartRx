import ChatBox from '../../components/ChatBox';

export default function Results() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Prescription Details Section */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Prescription Analysis</h1>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-500 italic">
                Prescription analysis results will appear here after loading.
              </p>
            </div>
          </div>
        </div>

        {/* AI Medical Assistant Chat Section */}
        <div className="lg:sticky lg:top-24 h-fit">
          <ChatBox />
        </div>

      </div>
    </div>
  );
}
