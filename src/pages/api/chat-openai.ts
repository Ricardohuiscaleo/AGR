import type { APIRoute } from 'astro';
import OpenAI from 'openai';

const getOpenAI = () => {
  const apiKey = import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'sk-proj-REEMPLAZA_CON_TU_KEY_NUEVA') {
    throw new Error('OPENAI_API_KEY no configurada');
  }
  return new OpenAI({ apiKey });
};

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const message = url.searchParams.get('message');
  const sessionId = url.searchParams.get('session');

  if (!message) {
    return new Response(JSON.stringify({ error: 'Mensaje requerido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres Gaby, asistente virtual de Agente RAG. Respondes de forma amigable, profesional y concisa en español.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    const response = completion.choices[0].message.content;

    return new Response(
      JSON.stringify({
        output: response,
        session_id: sessionId,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: 'Error al generar respuesta',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  const { message, session } = await request.json();

  if (!message) {
    return new Response(JSON.stringify({ error: 'Mensaje requerido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres Gaby, asistente virtual de Agente RAG. Respondes de forma amigable, profesional y concisa en español.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    const response = completion.choices[0].message.content;

    return new Response(
      JSON.stringify({
        output: response,
        session_id: session,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: 'Error al generar respuesta',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
