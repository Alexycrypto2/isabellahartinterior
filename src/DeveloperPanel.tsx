import React, { useState } from 'react';

export default function DeveloperPanel() {
  const [activeTab, setActiveTab] = useState('keys');
  
  // Temporary state for inputs
  const [claudeKey, setClaudeKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');

  const handleSave = () => {
    alert('Keys saved! (This is a test save for now)');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">🔧 Developer Engineer Panel</h1>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button 
            onClick={() => setActiveTab('keys')}
            className={`px-4 py-2 ${activeTab === 'keys' ? 'border-b-2 border-blue-500 text-blue-600 font-bold' : 'text-gray-500'}`}
          >
            🔑 API Keys
          </button>
          <button 
            onClick={() => setActiveTab('health')}
            className={`px-4 py-2 ${activeTab === 'health' ? 'border-b-2 border-blue-500 text-blue-600 font-bold' : 'text-gray-500'}`}
          >
            📊 Site Health
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 ${activeTab === 'ai' ? 'border-b-2 border-blue-500 text-blue-600 font-bold' : 'text-gray-500'}`}
          >
            🤖 AI Chat
          </button>
        </div>

        {/* Content for API Keys Tab */}
        {activeTab === 'keys' && (
          <div className="space-y-6">
            <div className="p-4 border rounded bg-gray-50">
              <h3 className="font-bold mb-2">Claude API Key (Sonnet)</h3>
              <input 
                type="password" 
                value={claudeKey}
                onChange={(e) => setClaudeKey(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                placeholder="Enter your Claude API Key..."
              />
              <button 
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save Key
              </button>
            </div>

            <div className="p-4 border rounded bg-gray-50">
              <h3 className="font-bold mb-2">Gemini API Key</h3>
              <input 
                type="password" 
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                placeholder="Enter your Gemini API Key..."
              />
              <button 
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save Key
              </button>
            </div>
          </div>
        )}

        {/* Content for Site Health Tab (Placeholder) */}
        {activeTab === 'health' && (
          <div className="text-center py-10 text-gray-500">
            <p>📊 Site Health Monitor will appear here.</p>
          </div>
        )}

        {/* Content for AI Chat Tab (Placeholder) */}
        {activeTab === 'ai' && (
          <div className="text-center py-10 text-gray-500">
            <p>🤖 AI Engineer Chat will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
                                              }
