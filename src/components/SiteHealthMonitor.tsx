import React, { useEffect, useState } from 'react';

const SiteHealthMonitor: React.FC = () => {
    const [status, setStatus] = useState<{ [key: string]: boolean }>({});

    const services = [
        'Chatbot',
        'Trending Products',
        'Blog Writer',
        'Pin Generator',
        'Product Import',
        'Email System'
    ];

    useEffect(() => {
        const checkServices = async () => {
            const serviceStatus = {};
            for (const service of services) {
                // Simulating service health checks with random boolean values
                serviceStatus[service] = Math.random() > 0.5;
            }
            setStatus(serviceStatus);
        };
        checkServices();
        const interval = setInterval(checkServices, 60000); // check every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h2>Site Health Monitor</h2>
            <ul>
                {services.map((service) => (
                    <li key={service} style={{ color: status[service] ? 'green' : 'red' }}>
                        {service}: {status[service] ? 'Operational' : 'Down'}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SiteHealthMonitor;