import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Server-side Gemini AI extraction assistant (if API key available)
app.post('/api/ai/extract', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY detected. Using deterministic engineering extraction pipeline.',
      });
    }

    const { documentText, documentType, equipmentTag } = req.body;
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are a Senior Mechanical Engineer specializing in Process and Mechanical Data Sheets.
Extract all engineering parameters for equipment "${equipmentTag || 'V-101'}" from the following ${documentType || 'document'}:

${documentText}

STRICT RULE: NEVER invent, infer, or hallucinate values. If a value is not explicitly stated, mark status as MISSING.
Provide JSON format with an array of objects:
[
  {
    "parameter": string,
    "value": string | number | null,
    "unit": string | null,
    "source_page": number,
    "source_section": string,
    "source_text": string,
    "confidence": number (0 to 1),
    "status": "Extracted" | "Missing" | "Uncertain"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    res.json({
      success: true,
      data: JSON.parse(response.text || '[]'),
    });
  } catch (error: any) {
    console.error('AI extraction error:', error);
    res.status(500).json({ error: error.message || 'AI extraction failed' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
