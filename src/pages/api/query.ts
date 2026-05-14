export const prerender = false

import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = await request.json()

		const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/query`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${import.meta.env.ProfessionalRAG_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		})

		const contentType = res.headers.get('content-type') || ''
		const raw = await res.text()

		if (!contentType.includes('application/json')) {
			const detail = res.ok
				? `Upstream returned non-JSON response (${res.status})`
				: `Upstream error ${res.status} ${res.statusText}`.trim()
			return new Response(JSON.stringify({ detail }), {
				status: res.ok ? 502 : res.status,
				headers: { 'Content-Type': 'application/json' }
			})
		}

		return new Response(raw, {
			status: res.status,
			headers: { 'Content-Type': 'application/json' }
		})
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Internal server error'
		return new Response(JSON.stringify({ detail: message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		})
	}
}
