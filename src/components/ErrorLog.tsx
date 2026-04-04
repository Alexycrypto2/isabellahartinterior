import React, { useEffect, useState } from 'react';

const ErrorLog = () => {
    const [errors, setErrors] = useState<{timestamp: string, message: string, feature: string, aiExplanation: string, fixSuggestion: string}[]>([]);

    // Function to log errors
    const logError = (message: string, feature: string, aiExplanation: string, fixSuggestion: string) => {
        const timestamp = new Date().toISOString();
        setErrors(prevErrors => [...prevErrors, { timestamp, message, feature, aiExplanation, fixSuggestion }]);
    };

    // Example error logging
    useEffect(() => {
        logError("Sample error message", "Sample feature", "AI explanation for the error", "Suggested fix for the error");
    }, []);

    return (
        <div>
            <h2>Error Log</h2>
            <ul>
                {errors.map((error, index) => (
                    <li key={index}>
                        <strong>{error.timestamp}</strong>: {error.message} (Feature: {error.feature})<br />
                        <em>AI Explanation:</em> {error.aiExplanation}<br />
                        <em>Fix Suggestion:</em> {error.fixSuggestion}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ErrorLog;