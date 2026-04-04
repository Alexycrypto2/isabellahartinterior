import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AIEngineerChat: React.FC = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState<string>('');

    const handleSendMessage = async () => {
        if (input.trim()) {
            const newMessages = [...messages, `User: ${input}`];
            setMessages(newMessages);
            setInput('');
            // API call to Claude or code debugging logic
            const response = await callClaudeAPI(input);
            setMessages([...newMessages, `AI: ${response}`]);
        }
    };

    const callClaudeAPI = async (message: string) => {
        // Replace with actual API endpoint and key
        const response = await axios.post('https://api.claude.ai/chat', {
            message: message,
        });
        return response.data.answer; // Adapt based on the actual response structure
    };

    const handleReadGitHubFile = async (filePath: string) => {
        // Assume that the GitHub API token and repo details are available
        const response = await axios.get(`https://api.github.com/repos/Alexycrypto2/isabellahartinterior/contents/${filePath}`, {
            headers: {
                Authorization: `token YOUR_GITHUB_TOKEN`
            }
        });
        return response.data; // Adapt based on the actual response structure
    };

    return (
        <div>
            <h1>AI Engineer Chat</h1>
            <div>
                {messages.map((msg, index) => (
                    <p key={index}>{msg}</p>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>Send</button>
        </div>
    );
};

export default AIEngineerChat;