'use client';

import { useState } from 'react';

export default function ChatBox() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-[500px] overflow-hidden">
      {/* Header */}
      <div className="bg-brand-600 p-4 text-white">
        <h3 className="font-semibold text-lg">AI Medical Assistant</h3>
        <p className="text-xs text-brand-100">Ask anything about your prescription medicines, tests or precautions</p>
      </div>

      {/* Message Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
        <p className="text-sm text-gray-500 text-center italic mt-4">
          Upload a prescription first to start chatting with the assistant.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => e.preventDefault()} className="p-3 border-t border-gray-200 flex gap-2 bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your medicines..."
          className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition duration-200"
        >
          Send
        </button>
      </form>
    </div>
  );
}
