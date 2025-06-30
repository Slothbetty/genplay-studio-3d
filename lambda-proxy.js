const fetch = require('node-fetch');

exports.handler = async (event) => {
    const { httpMethod, path, queryStringParameters, body, headers } = event;
    
    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-API-Key',
        'Access-Control-Max-Age': '86400'
    };
    
    // Handle preflight requests
    if (httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }
    
    try {
        // Get API key from environment variable
        const apiKey = process.env.TRIPO_API_KEY;
        if (!apiKey) {
            throw new Error('TRIPO_API_KEY environment variable not set');
        }
        
        // Handle different endpoints
        let targetUrl;
        let requestOptions = {
            method: httpMethod,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        };
        
        // Handle file uploads
        if (path.includes('/upload/sts')) {
            targetUrl = `https://api.tripo3d.ai/v2/openapi/upload/sts`;
            
            // For file uploads, we need to handle multipart/form-data
            if (body && !body.includes('Content-Type: multipart/form-data')) {
                requestOptions.headers['Content-Type'] = 'application/json';
                requestOptions.body = body;
            }
        }
        // Handle task creation
        else if (path.includes('/task') && httpMethod === 'POST') {
            targetUrl = `https://api.tripo3d.ai/v2/openapi/task`;
            requestOptions.body = body;
        }
        // Handle task status polling
        else if (path.includes('/task/') && httpMethod === 'GET') {
            const taskId = path.split('/task/')[1];
            targetUrl = `https://api.tripo3d.ai/v2/openapi/task/${taskId}`;
        }
        // Handle model downloads
        else if (path.includes('/download')) {
            const url = queryStringParameters?.url;
            if (!url) {
                throw new Error('URL parameter is required for download');
            }
            
            // Ensure URL has protocol
            const fullUrl = url.startsWith('http') ? url : `https://${url}`;
            
            const response = await fetch(fullUrl);
            if (!response.ok) {
                throw new Error(`Download failed: ${response.status}`);
            }
            
            const buffer = await response.arrayBuffer();
            const contentType = url.includes('.glb') ? 'application/octet-stream' : 'application/octet-stream';
            
            return {
                statusCode: 200,
                headers: {
                    ...corsHeaders,
                    'Content-Type': contentType,
                    'Content-Length': buffer.byteLength
                },
                body: Buffer.from(buffer).toString('base64'),
                isBase64Encoded: true
            };
        }
        else {
            throw new Error(`Unsupported endpoint: ${path}`);
        }
        
        // Make request to Tripo 3D API
        const response = await fetch(targetUrl, requestOptions);
        const responseBody = await response.text();
        
        return {
            statusCode: response.status,
            headers: {
                ...corsHeaders,
                'Content-Type': response.headers.get('content-type') || 'application/json'
            },
            body: responseBody
        };
        
    } catch (error) {
        console.error('Lambda proxy error:', error);
        
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
}; 