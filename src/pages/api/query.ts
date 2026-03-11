export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();

  const res = await fetch('https://professionalrag-738260384801.us-east4.run.app/query', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.ProfessionalRAG_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
};
