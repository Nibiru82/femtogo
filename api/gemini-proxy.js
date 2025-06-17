export default async function handler(request, response) {
  // On ne récupère que la partie "prompt" de la demande du site
  const { prompt } = request.body;
  
  // La clé API est récupérée depuis les variables d'environnement de Vercel, jamais visible par l'utilisateur
  const apiKey = process.env.GEMINI_API_KEY;

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      }),
    });

    if (!geminiResponse.ok) {
      throw new Error('La requête vers l'API Gemini a échoué');
    }

    const data = await geminiResponse.json();
    
    // On renvoie la réponse de Gemini au site
    response.status(200).json(data);

  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}
