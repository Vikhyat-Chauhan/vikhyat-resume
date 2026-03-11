import { useState, useRef, useEffect } from 'react'
import Markdown from 'react-markdown'

interface Source {
	page: number | string
	score: number
	text: string
}

interface Metrics {
	total_ms: number
	cost_usd: number
	top_score: number
}

interface Message {
	role: 'user' | 'assistant'
	content: string
	sources?: Source[]
	metrics?: Metrics
	streaming?: boolean
}

export default function ChatWidget() {
	const [messages, setMessages] = useState<Message[]>([])
	const [input, setInput] = useState('')
	const [loading, setLoading] = useState(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLTextAreaElement>(null)

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		const question = input.trim()
		if (!question || loading) return

		setInput('')
		setLoading(true)

		const userMsg: Message = { role: 'user', content: question }
		const assistantMsg: Message = { role: 'assistant', content: '', streaming: true }
		setMessages((prev) => [...prev, userMsg, assistantMsg])

		try {
			const res = await fetch('/api/query', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ question })
			})

			if (!res.ok) {
				const err = await res.json().catch(() => ({ detail: res.statusText }))
				throw new Error(err.detail || 'Request failed')
			}

			const data = await res.json()

			setMessages((prev) => {
				const updated = [...prev]
				const last = updated[updated.length - 1]
				last.content = data.answer
				last.sources = data.sources
				last.metrics = data.metrics
				last.streaming = false
				return [...updated]
			})
		} catch (err) {
			setMessages((prev) => {
				const updated = [...prev]
				const last = updated[updated.length - 1]
				last.content = `Error: ${err instanceof Error ? err.message : 'Something went wrong'}`
				last.streaming = false
				return [...updated]
			})
		} finally {
			setLoading(false)
			inputRef.current?.focus()
		}
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSubmit(e)
		}
	}

	return (
		<div className='flex w-full flex-col' style={{ height: 'calc(100vh - 12rem)' }}>
			{/* Messages */}
			<div className='flex-1 space-y-4 overflow-y-auto pb-4'>
				{messages.length === 0 && (
					<div className='flex h-full flex-col items-center justify-center gap-3 text-center'>
						<p className='text-lg font-medium text-foreground'>What would you like to know?</p>
						<p className='text-sm text-muted-foreground'>
							Ask about my research, projects, experience, or any ingested documents
						</p>
						<div className='mt-4 flex flex-wrap justify-center gap-2'>
							{[
								"What is Vikhyat's research about?",
								'Tell me about the Hydra project',
								'What skills does Vikhyat have?'
							].map((q) => (
								<button
									key={q}
									onClick={() => {
										setInput(q)
										inputRef.current?.focus()
									}}
									className='rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
								>
									{q}
								</button>
							))}
						</div>
					</div>
				)}

				{messages.map((msg, i) => (
					<div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
						<div
							className={`max-w-[85%] border border-border px-4 py-3 ${
								msg.role === 'user'
									? 'rounded-[20px_20px_4px_20px] bg-primary text-primary-foreground'
									: 'rounded-[20px_20px_20px_4px] bg-card text-card-foreground'
							}`}
						>
							{msg.role === 'user' ? (
								<p className='whitespace-pre-wrap break-words text-sm leading-relaxed'>
									{msg.content}
								</p>
							) : msg.streaming && !msg.content ? (
								<div className='flex items-center gap-1.5 py-1'>
									<span className='mr-1 text-xs text-muted-foreground'>Thinking</span>
									<span className='h-1.5 w-1.5 animate-[bounce_1.4s_ease-in-out_infinite] rounded-full bg-purple-400' />
									<span className='h-1.5 w-1.5 animate-[bounce_1.4s_ease-in-out_0.2s_infinite] rounded-full bg-purple-400' />
									<span className='h-1.5 w-1.5 animate-[bounce_1.4s_ease-in-out_0.4s_infinite] rounded-full bg-purple-400' />
								</div>
							) : (
								<div className='prose prose-sm max-w-none break-words text-sm leading-relaxed dark:prose-invert prose-headings:my-2 prose-p:my-1 prose-ol:my-1 prose-ul:my-1 prose-li:my-0.5'>
									<Markdown>{msg.content}</Markdown>
								</div>
							)}

							{msg.sources && msg.sources.length > 0 && (
								<div className='mt-3 border-t border-border pt-2.5'>
									<p className='mb-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground'>
										Sources
									</p>
									{msg.sources.map((src, j) => (
										<div key={j} className='flex items-center justify-between py-0.5 text-xs'>
											<span className='font-mono text-blue-500 dark:text-blue-400'>
												{typeof src.page === 'string' && src.page.includes('/')
													? src.page
													: `Page ${src.page}`}
											</span>
											<span className='text-muted-foreground'>
												{(src.score * 100).toFixed(0)}% match
											</span>
										</div>
									))}
								</div>
							)}

							{msg.metrics && (
								<div className='mt-2 flex gap-3 font-mono text-[0.65rem] text-muted-foreground'>
									<span>{msg.metrics.total_ms.toFixed(0)}ms</span>
									<span>${msg.metrics.cost_usd.toFixed(4)}</span>
								</div>
							)}
						</div>
					</div>
				))}
				<div ref={messagesEndRef} />
			</div>

			{/* Input */}
			<form onSubmit={handleSubmit} className='border-t border-border pt-4'>
				<div className='flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2'>
					<textarea
						ref={inputRef}
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder='Ask a question...'
						rows={1}
						disabled={loading}
						className='flex-1 resize-none border-none bg-transparent font-[inherit] text-sm text-foreground outline-none placeholder:text-muted-foreground'
					/>
					<button
						type='submit'
						disabled={loading || !input.trim()}
						aria-label='Send message'
						className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-30'
					>
						<svg width='18' height='18' viewBox='0 0 24 24' fill='none'>
							<path
								d='M22 2L11 13'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
							<path
								d='M22 2L15 22L11 13L2 9L22 2Z'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
					</button>
				</div>
				<p className='mt-2 text-center text-[0.6rem] text-muted-foreground'>
					Powered by{' '}
					<a
						href='https://github.com/Vikhyat-Chauhan/ProfessionalRAG'
						target='_blank'
						rel='noopener noreferrer'
						className='underline hover:text-foreground'
					>
						ProfessionalRAG
					</a>{' '}
					— Built by me using Claude + Pinecone + Cross-Encoder Reranking
				</p>
			</form>
		</div>
	)
}
