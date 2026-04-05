export default function DeveloperPanel() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>🔧 Developer Panel - TEST</h1>
      <p>If you see this, it's working!</p>
    </div>
  );
}            🤖 AI Chat
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
