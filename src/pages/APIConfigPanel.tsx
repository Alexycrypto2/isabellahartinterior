import React, { useEffect, useState } from 'react';

const APIConfigPanel = () => {
    const [apiKeys, setApiKeys] = useState([]);
    const [newApiKey, setNewApiKey] = useState('');

    useEffect(() => {
        const storedKeys = JSON.parse(localStorage.getItem('apiKeys')) || [];
        setApiKeys(storedKeys);
    }, []);

    useEffect(() => {
        localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
    }, [apiKeys]);

    const handleAddKey = () => {
        if (newApiKey && !apiKeys.includes(newApiKey)) {
            setApiKeys([...apiKeys, newApiKey]);
            setNewApiKey('');
        }
    };

    const handleDeleteKey = (keyToDelete) => {
        setApiKeys(apiKeys.filter(key => key !== keyToDelete));
    };

    const isKeyValid = (key) => {
        // Replace with actual validation logic
        return key.length === 32; // Example: keys must be 32 characters long
    };

    return (
        <div>
            <h1>API Configuration Panel</h1>
            <input
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder="Enter new API key"
            />
            <button onClick={handleAddKey}>Add API Key</button>
            <div>
                <h2>Existing API Keys</h2>
                <ul>
                    {apiKeys.map((key, index) => (
                        <li key={index} style={{ color: isKeyValid(key) ? 'green' : 'red' }}>
                            {key} 
                            <button onClick={() => handleDeleteKey(key)}>Delete</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default APIConfigPanel;