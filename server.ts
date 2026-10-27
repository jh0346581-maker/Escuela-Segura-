import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // AI School Mediation Chatbot API
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'El mensaje es obligatorio' });
      }

      if (!ai) {
        // Fallback response if no API key is provided
        return res.json({
          reply:
            '¡Hola! Soy PazBot, el mediador escolar virtual de Escuela Segura. Te escucho con atención y respeto. La mejor manera de resolver un conflicto es haciendo una pausa para calmarnos, dialogar sin ofender y buscar acuerdos justos. ¿Te gustaría contarme qué ocurrió o prefieres que agendemos mediación presencial?',
        });
      }

      const systemInstruction = `Eres 'PazBot', el asistente virtual y mediador escolar inteligente de 'Escuela Segura', una aplicación para la prevención de conflictos, fomento de la sana convivencia y resguardo escolar.
Tu personalidad:
- Cálida, empática, paciente, conciliadora y sin prejuicios.
- Especialista en mediación escolar entre pares, prevención del bullying y ciberbullying, manejo de emociones y comunicación asertiva.

Tus objetivos al responder:
1. Validar las emociones del usuario sin juzgar ("Es natural que te sientas molesto o triste ante esa situación...").
2. Brindar consejos prácticos y pacíficos de desescalamiento (técnicas de respiración, hablar usando 'mensajes yo' en vez de culpar, pedir disculpas, establecer límites respetuosos).
3. Recordar que las agresiones físicas o insultos nunca resuelven un problema y solo generan consecuencias negativas.
4. Si se menciona agresión física activa, amenazas graves, armas, o situaciones de riesgo inmediato, aconseja con urgencia acudir con un profesor/prefecto/directivo o activar el Botón SOS en la app.
5. Ofrecer opciones para crear un Reporte Silencioso anónimo dentro de Escuela Segura o hablar con la orientadora escolar.

Pautas de formato:
- Responde siempre en español.
- Sé claro, conciso y amigable (máximo 2 a 3 párrafos cortos).
- Emplea un tono cercano apto para jóvenes estudiantes, docentes y padres.`;

      // Build conversation contents
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item.sender === 'user') {
            contents.push({ role: 'user', parts: [{ text: item.text }] });
          } else if (item.sender === 'mediator' || item.sender === 'bot') {
            contents.push({ role: 'model', parts: [{ text: item.text }] });
          }
        }
      }

      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      const reply =
        response.text ||
        'Comprendo tu sentir. Recuerda que no estás solo y siempre puedes acudir al equipo de convivencia escolar.';

      return res.json({ reply });
    } catch (error) {
      console.error('Error generating AI response:', error);
      return res.json({
        reply:
          'Entiendo la situación. En los momentos de conflicto es crucial respirar hondo y evitar responder con violencia. Te recomiendo conversar con un docente de confianza o solicitar una mediación en privado a través del menú de Reporte.',
      });
    }
  });

  // Serve Vite in development or static dist in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
