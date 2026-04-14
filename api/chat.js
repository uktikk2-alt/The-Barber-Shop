export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { contents, generationConfig, modelName } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured on server' });
    }

    // Attempt both API versions for robustness, matching client logic
    const versions = ["v1beta", "v1"];
    let lastError = null;

    for (const ver of versions) {
        try {
            const url = `https://generativelanguage.googleapis.com/${ver}/models/${modelName || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`;
            
            const apiResponse = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents, generationConfig }),
            });

            const data = await apiResponse.json();

            if (apiResponse.ok) {
                return res.status(200).json(data);
            } else {
                lastError = data.error?.message || 'API error';
            }
        } catch (error) {
            lastError = error.message;
        }
    }

    return res.status(500).json({ error: `Backend Error: ${lastError}` });
}
