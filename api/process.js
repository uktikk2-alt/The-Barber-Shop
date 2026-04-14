module.exports = async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Check if API key is missing
    if (!apiKey) {
        console.error("DEBUG: GEMINI_API_KEY is missing from environment variables.");
        return res.status(200).json({ 
            error: "Security Error: I am missing my brain (API Key). Please add GEMINI_API_KEY to your Vercel Environment Variables.",
            candidates: [{ content: { parts: [{ text: "⚠️ Technical Error: API Key missing in Vercel settings." }] } }]
        });
    }

    try {
        const { contents, generationConfig, modelName } = req.body;

        // Attempt both API versions for robustness
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
                    lastError = data.error?.message || 'Upstream API error';
                }
            } catch (error) {
                lastError = error.message;
            }
        }

        return res.status(500).json({ error: `AI Error: ${lastError}` });

    } catch (error) {
        console.error("DEBUG: Request processing failed:", error);
        return res.status(500).json({ error: "Internal Server Error: Failed to process request" });
    }
}
