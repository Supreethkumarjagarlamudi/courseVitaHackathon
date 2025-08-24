// Simple Vercel serverless function
export default function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, Origin, Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Simple response for testing
    if (req.method === 'GET') {
        if (req.url === '/health' || req.url === '/api/health') {
            return res.status(200).json({ 
                status: "OK", 
                message: "Server is running",
                timestamp: new Date().toISOString()
            });
        }
        
        if (req.url === '/api/test') {
            return res.status(200).json({ 
                message: "API is working!",
                method: req.method,
                url: req.url
            });
        }
    }
    
    // Default response
    res.status(200).json({ 
        message: "Hello from Occasio Backend!",
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
    });
}
