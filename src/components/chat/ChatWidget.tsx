import { useState, useRef, useEffect, useCallback } from 'react'
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
	const scrollAnchorRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLTextAreaElement>(null)

	// Scroll anchor element into view when messages change
	useEffect(() => {
		scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	// Auto-resize textarea
	const resizeTextarea = useCallback(() => {
		const el = inputRef.current
		if (!el) return
		el.style.height = 'auto'
		el.style.height = Math.min(el.scrollHeight, 120) + 'px'
	}, [])

	useEffect(() => {
		resizeTextarea()
	}, [input, resizeTextarea])

	const submitQuestion = useCallback(
		async (question: string) => {
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
		},
		[loading]
	)

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		submitQuestion(input.trim())
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			submitQuestion(input.trim())
		}
	}

	return (
		<div className='flex min-h-0 flex-1 flex-col'>
			{/* Scrollable messages region */}
			<div
				role='log'
				aria-live='polite'
				className='min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pb-4'
			>
				{messages.length === 0 && (
					<div className='flex h-full flex-col items-center justify-center gap-4 px-4 text-center'>
						<div className='flex flex-col gap-1'>
							<p className='text-lg font-semibold text-foreground'>
								What would you like to know?
							</p>
							<p className='text-sm text-muted-foreground'>
								Ask about my research, projects, experience, or resume
							</p>
						</div>
						<div className='mt-2 flex flex-wrap justify-center gap-2'>
							{[
								"What is Vikhyat's research about?",
								'Tell me about the Hydra project',
								'What skills does Vikhyat have?'
							].map((q) => (
								<button
									key={q}
									onClick={() => submitQuestion(q)}
									disabled={loading}
									className='rounded-full border border-border/50 bg-card px-4 py-2 text-xs text-muted-foreground transition-all duration-200 hover:border-border hover:bg-secondary hover:text-foreground disabled:opacity-50'
								>
									{q}
								</button>
							))}
						</div>
					</div>
				)}

				{messages.map((msg, i) => (
					<div
						key={i}
						className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
					>
						<div
							className={`max-w-[85%] px-4 py-3 sm:max-w-[75%] ${
								msg.role === 'user'
									? 'rounded-[20px_20px_4px_20px] border border-sage/30 bg-sage/15 text-foreground'
									: 'rounded-[20px_20px_20px_4px] border border-border/50 bg-card text-card-foreground'
							}`}
						>
							{msg.role === 'user' ? (
								<p className='whitespace-pre-wrap break-words text-sm leading-relaxed'>
									{msg.content}
								</p>
							) : msg.streaming && !msg.content ? (
								<div className='flex items-center gap-1.5 py-1'>
									<span className='mr-1 text-xs text-muted-foreground'>Thinking</span>
									<span className='h-1.5 w-1.5 animate-[bounce_1.4s_ease-in-out_infinite] rounded-full bg-plum' />
									<span className='h-1.5 w-1.5 animate-[bounce_1.4s_ease-in-out_0.2s_infinite] rounded-full bg-plum' />
									<span className='h-1.5 w-1.5 animate-[bounce_1.4s_ease-in-out_0.4s_infinite] rounded-full bg-plum' />
								</div>
							) : (
								<div className='prose prose-sm prose-invert max-w-none break-words text-sm leading-relaxed prose-headings:my-2 prose-p:my-1 prose-ol:my-1 prose-ul:my-1 prose-li:my-0.5'>
									<Markdown>{msg.content}</Markdown>
								</div>
							)}

							{msg.sources && msg.sources.length > 0 && (
								<div className='mt-3 border-t border-border/50 pt-2.5'>
									<p className='mb-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground'>
										Sources
									</p>
									{msg.sources.map((src, j) => (
										<div
											key={j}
											className='flex items-center justify-between py-0.5 text-xs'
										>
											<span className='font-mono text-sage'>
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

				{/* Scroll anchor — kept at the bottom of the scrollable area */}
				<div ref={scrollAnchorRef} aria-hidden='true' style={{ overflowAnchor: 'auto' }} />
			</div>

			{/* Input — pinned to bottom via flex-shrink-0 */}
			<div className='flex-shrink-0 border-t border-border/50 bg-background pt-4'>
				{messages.length > 0 && (
					<div className='mb-3 flex justify-center'>
						<button
							onClick={() => setMessages([])}
							className='text-xs text-muted-foreground transition-colors hover:text-foreground'
						>
							Clear chat
						</button>
					</div>
				)}
				<form onSubmit={handleSubmit}>
					<div className='flex items-end gap-2 rounded-2xl border border-border/50 bg-card px-3 py-2'>
						<textarea
							ref={inputRef}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder='Ask a question...'
							rows={1}
							disabled={loading}
							className='flex-1 resize-none border-none bg-transparent font-[inherit] text-sm text-foreground outline-none placeholder:text-muted-foreground'
							style={{ maxHeight: '120px' }}
						/>
						<button
							type='submit'
							disabled={loading || !input.trim()}
							aria-label='Send message'
							className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-sage text-background transition-opacity hover:bg-sage/85 disabled:opacity-30'
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
							className='text-sage/80 underline transition-colors hover:text-sage'
						>
							ProfessionalRAG
						</a>{' '}
						— Claude + Pinecone + Cross-Encoder Reranking
					</p>
				</form>
			</div>
		</div>
	)
}
