export const prerender = false

import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = await request.json()

		const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/track`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${import.meta.env.ProfessionalRAG_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		})

		return new Response(null, { status: res.ok ? 204 : res.status })
	} catch {
		return new Response(null, { status: 500 })
	}
}
