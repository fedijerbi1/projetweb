require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

app.get('/api/health', (req, res) => {
    res.json({ ok: true, message: 'Backend actif' });
});

app.post('/api/recommendations', async (req, res) => {
    try {
        const { budget, experience, cuisine, climat, passion } = req.body || {};

        if (!budget || !experience || !cuisine || !climat || !passion) {
            return res.status(400).json({
                message: 'Tous les champs sont obligatoires: budget, experience, cuisine, climat, passion.'
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                message: 'GEMINI_API_KEY manquante dans le fichier .env'
            });
        }

        const prompt = `Tu es un expert en voyages. Recommande 3 destinations parmi: barcelone, tokyo, santorin, istanbul, costarica, patagonie, florence, islande.

Profil de l'utilisateur:
- Budget: ${budget}
- Expérience recherchée: ${experience}
- Cuisine préférée: ${cuisine}
- Climat préféré: ${climat}
- Passion: ${passion}

Réponds UNIQUEMENT avec 3 destinations séparées par des virgules (exemple: barcelone,tokyo,santorin). Rien d'autre.`;

        const geminiResponse = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 100
                }
            })
        });

        if (!geminiResponse.ok) {
            const errText = await geminiResponse.text();
            return res.status(geminiResponse.status).json({
                message: 'Erreur Gemini API',
                details: errText
            });
        }

        const data = await geminiResponse.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

        const allowed = new Set([
            'barcelone',
            'tokyo',
            'santorin',
            'istanbul',
            'costarica',
            'patagonie',
            'florence',
            'islande'
        ]);

        const recommendations = text
            .split(',')
            .map((v) => v.trim().toLowerCase())
            .filter((v) => allowed.has(v))
            .slice(0, 3);

        return res.json({ recommendations, raw: text });
    } catch (error) {
        return res.status(500).json({
            message: 'Erreur serveur lors de la recommandation.',
            details: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});