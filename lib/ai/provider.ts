import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AICompletionOptions {
  /** Max tokens for the response (default 4096) */
  maxTokens?: number
  /** Temperature for randomness (default 0.3 for structured output) */
  temperature?: number
}

export interface AIProvider {
  readonly name: string
  complete(
    messages: AIMessage[],
    systemPrompt: string,
    options?: AICompletionOptions,
  ): Promise<string>
}

function normalizeAnthropicModel(model: string): string {
  const normalized = model.trim()
  if (!normalized) return 'claude-3-sonnet-20240229'

  // Anthropic API requires exact model ids; map common shorthand aliases.
  switch (normalized) {
    case 'claude-sonnet-4':
    case 'claude-sonnet-4-6':
      return 'claude-sonnet-4-20250514'
    case 'claude-opus-4':
      return 'claude-opus-4-20250514'
    case 'claude-haiku-4':
      return 'claude-haiku-4-5-20251001'
    default:
      return normalized
  }
}

// ─── Anthropic Provider ───────────────────────────────────────────────────────

class AnthropicProvider implements AIProvider {
  readonly name = 'anthropic'
  private client: Anthropic
  private modelName: string

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')
    // Disable SDK-internal retries so our own retry/timeout logic stays in control.
    this.client = new Anthropic({ apiKey, maxRetries: 0 })
    // Default to a stable model id; normalize shorthand aliases if provided.
    this.modelName = normalizeAnthropicModel(
      process.env.ANTHROPIC_MODEL ?? 'claude-3-sonnet-20240229',
    )
  }

  async complete(
    messages: AIMessage[],
    systemPrompt: string,
    options?: AICompletionOptions,
  ): Promise<string> {
    const response = await this.client.messages.create({
      model: this.modelName,
      max_tokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.3,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    })

    const block = response.content[0]
    if (block.type !== 'text') throw new Error('Unexpected Anthropic response type')
    return block.text
  }
}

// ─── OpenAI Provider ──────────────────────────────────────────────────────────

class OpenAIProvider implements AIProvider {
  readonly name = 'openai'
  private client: OpenAI
  private modelName: string

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY is not set')
    // Disable SDK-internal retries so our own retry/timeout logic stays in control.
    this.client = new OpenAI({ apiKey, maxRetries: 0 })
    this.modelName = process.env.OPENAI_MODEL ?? 'gpt-4o'
  }

  async complete(
    messages: AIMessage[],
    systemPrompt: string,
    options?: AICompletionOptions,
  ): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.modelName,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 4096,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('Empty OpenAI response')
    return content
  }
}

// ─── Gemini Provider ─────────────────────────────────────────────────────────

class GeminiProvider implements AIProvider {
  readonly name = 'gemini'
  private client: GoogleGenerativeAI
  private modelName: string

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set')
    this.client = new GoogleGenerativeAI(apiKey)
    this.modelName = process.env.GEMINI_MODEL ?? 'gemini-1.5-pro'
  }

  async complete(
    messages: AIMessage[],
    systemPrompt: string,
    options?: AICompletionOptions,
  ): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: systemPrompt,
      generationConfig: {
        maxOutputTokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.3,
      },
    })

    // Gemini requires alternating user/model roles — map 'assistant' → 'model'
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const lastMessage = messages[messages.length - 1]
    const chat = model.startChat({ history })
    const result = await chat.sendMessage(lastMessage.content)
    const text = result.response.text()
    if (!text) throw new Error('Empty Gemini response')
    return text
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

let _provider: AIProvider | null = null
let _cachedProviderName: string | null = null

export function getAIProvider(): AIProvider {
  const providerName = (process.env.AI_PROVIDER ?? 'anthropic').toLowerCase()

  // Re-initialise if provider changed (e.g. env var updated in dev)
  if (_provider && _cachedProviderName === providerName) return _provider

  switch (providerName) {
    case 'openai':
      _provider = new OpenAIProvider()
      break
    case 'gemini':
      _provider = new GeminiProvider()
      break
    case 'anthropic':
    default:
      _provider = new AnthropicProvider()
      break
  }

  _cachedProviderName = providerName
  return _provider
}

/** Convenience export — lazily initialised singleton */
export const aiProvider = {
  get instance(): AIProvider {
    return getAIProvider()
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract the JSON block from an AI response that may contain markdown fences.
 * Falls back to the raw text if no fences are found.
 */
export function extractJSON(raw: string): string {
  // Try to find ```json ... ``` first, then plain ``` ... ```
  const jsonFenceMatch = raw.match(/```json\s*([\s\S]*?)```/)
  if (jsonFenceMatch) return jsonFenceMatch[1].trim()

  const fenceMatch = raw.match(/```\s*([\s\S]*?)```/)
  if (fenceMatch) return fenceMatch[1].trim()

  // Try to find raw JSON object or array
  const objMatch = raw.match(/(\{[\s\S]*\})/)
  if (objMatch) return objMatch[1].trim()

  const arrMatch = raw.match(/(\[[\s\S]*\])/)
  if (arrMatch) return arrMatch[1].trim()

  return raw.trim()
}
