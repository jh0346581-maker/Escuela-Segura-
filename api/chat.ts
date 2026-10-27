import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';

interface VercelApiRequest extends IncomingMessage {
  body?: unknown;
  query?: Record<string, string>;
  method?: string;
}

interface VercelApiResponse extends ServerResponse {
  status?: (statusCode: number) => VercelApiResponse;
  json?: (data: unknown) => void;
  send?: (body: unknown) => void;
}

function sendResponse(res: VercelApiResponse, statusCode: number, data: unknown) {
  if (typeof res.status === 'function') {
    res.status(statusCode);
  } else {
    res.statusCode = statusCode;
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (typeof res.json === 'function') {
    res.json(data);
  } else {
    res.end(JSON.stringify(data));
  }
}

export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  // Configuración de cabeceras CORS para Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    return sendResponse(res, 405, { error: 'Método no permitido. Utilice POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // mantener como estaba
      }
    }

    const { message, history } = (body as { message?: string; history?: Array<{ sender: string; text: string }> }) || {};

    if (!message || typeof message !== 'string') {
      return sendResponse(res, 400, { error: 'El mensaje es obligatorio' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Respuesta de contingencia si no se configuró clave API en Vercel
      return sendResponse(res, 200, {
        reply:
          '¡Hola! Soy PazBot, el mediador escolar virtual de Escuela Segura. Te escucho con atención y respeto. La mejor manera de resolver un conflicto es haciendo una pausa para calmarnos, dialogar sin ofender y buscar acuerdos justos. ¿Te gustaría contarme qué ocurrió o prefieres que agendemos una mediación presencial?',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-vercel',
        },
      },
    });

    const systemInstruction = `Eres 'PazBot', el asistente virtual y mediador escolar inteligente de 'Escuela Segura', una aplicación para la prevención de conflictos, fomento de la sana convivencia y resguardo escolar.
Tu personalidad:
- Cálida, empática, paciente, conciliadora y sin prejuicios.
- Especialista en mediación escolar entre pares, prevención del bullying y ciberbullying, manejo de emociones y comunicación asertiva.

Tus objetivos al responder:
1. Validar las emociones del usuario sin juzgar ("Es natural que te sientas molesto o triste ante esa situación...").
2. Brindar consejos prácticos y pacíficos de desescalamiento (técnicas de respiración, hablar usando 'mensajes yo' en vez de culpar, pedir disculpas, establecer límites respetuosos).
3. Recordar que las agresiones físicas o insultos nunca resuelven un problema y solo generan consecuencias negativas.
4. Si se menciona agresión física activa, amenazas graves, armas, o situaciones de riesgo inmediato, aconseja con urgencia acudir con un profesor/prefecto/directivo o activar el Botón SOS en la app.
5. Ofrecer opciones para crear un Reporte Silencioso dentro de Escuela Segura o hablar con la orientadora escolar.

Pautas de formato:
- Responde siempre en español.
- Sé claro, conciso y amigable (máximo 2 a 3 párrafos cortos).
- Emplea un tono cercano apto para jóvenes estudiantes, docentes y familias.`;

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

    return sendResponse(res, 200, { reply });
  } catch (error) {
    console.error('Error en función serverless PazBot Vercel:', error);
    return sendResponse(res, 200, {
      reply:
        'Entiendo la situación. En los momentos de conflicto es crucial respirar hondo y evitar responder con violencia. Te recomiendo conversar con un docente de confianza o solicitar una mediación en privado a través del menú de Reporte.',
    });
  }
}
