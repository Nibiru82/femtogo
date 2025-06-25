export default async function handler(request, response) {
  // Vérification de sécurité : la méthode doit être POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Vérification de la présence du corps de la requête
    if (!request.body) {
      return response.status(400).json({ error: 'Request body is missing' });
    }
    
    const { prompt } = request.body;

    // Vérification que le "prompt" est bien présent
    if (!prompt) {
      return response.status(400).json({ error: 'Prompt is missing from request body' });
    }

    // Récupération sécurisée de la clé API depuis les variables d'environnement
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Cette erreur ne s'affichera que si la variable n'est pas configurée sur Vercel
      return response.status(500).json({ error: 'API Key is not configured on the server' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      }),
    });

    const responseData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      // Si Gemini renvoie une erreur (clé invalide, etc.), on la transmet
      return response.status(geminiResponse.status).json({ error: `Gemini API Error: ${responseData.error?.message || 'Unknown error'}` });
    }
    
    // Si tout va bien, on renvoie la réponse de Gemini au site
    response.status(200).json(responseData);

  } catch (error) {
    console.error('Proxy Error:', error);
    response.status(500).json({ error: 'An internal server error occurred.' });
  }
}
