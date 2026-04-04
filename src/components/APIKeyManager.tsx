import React, { useState } from 'react';

const APIKeyManager = () => {
    const [geminiKey, setGeminiKey] = useState('');
    const [claudeKey, setClaudeKey] = useState('');
    const [amazonKey, setAmazonKey] = useState('');
    const [pinterestKey, setPinterestKey] = useState('');
    const [validityAlerts, setValidityAlerts] = useState([]);
    const [usageTracking, setUsageTracking] = useState({});

    const validateKey = (key) => {
        // Replace with actual validation logic
        return !!key; // Dummy validation
    };

    const handleSave = (keyType, key) => {
        if (validateKey(key)) {
            switch (keyType) {
                case 'gemini':
                    setGeminiKey(key);
                    break;
                case 'claude':
                    setClaudeKey(key);
                    break;
                case 'amazon':
                    setAmazonKey(key);
                    break;
                case 'pinterest':
                    setPinterestKey(key);
                    break;
                default:
                    break;
            }
            setValidityAlerts((prev) => [`${keyType} key saved successfully!`, ...prev]);
        } else {
            setValidityAlerts((prev) => [`${keyType} key is invalid!`, ...prev]);
        }
    };

    return (
        <div>
            <h1>API Key Manager</h1>
            <div>
                <h2>Manage API Keys</h2>
                <input
                    type="text"
                    placeholder="Gemini API Key"
                    value={geminiKey}
                    onChange={(e) => handleSave('gemini', e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Claude API Key"
                    value={claudeKey}
                    onChange={(e) => handleSave('claude', e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Amazon Associates Tag"
                    value={amazonKey}
                    onChange={(e) => handleSave('amazon', e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Pinterest API Key"
                    value={pinterestKey}
                    onChange={(e) => handleSave('pinterest', e.target.value)}
                />
            </div>
            <div>
                <h2>Validity Alerts</h2>
                {validityAlerts.map((alert, index) => (
                    <p key={index}>{alert}</p>
                ))}
            </div>
            <div>
                <h2>Usage Tracking</h2>
                <pre>{JSON.stringify(usageTracking, null, 2)}</pre>
            </div>
        </div>
    );
};

export default APIKeyManager;