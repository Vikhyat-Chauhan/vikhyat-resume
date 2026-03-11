export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();

  const res = await fetch('${import.meta.env.PUBLIC_API_URL}/query', {
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
