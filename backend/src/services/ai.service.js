import Groq, { RateLimitError, APIConnectionTimeoutError, APIConnectionError } from 'groq-sdk';

// Model availability varies by Groq account, so it stays overridable without a code change.
const MODEL = process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b';
const REQUEST_TIMEOUT_MS = 20_000;

const SYSTEM_PROMPT =
  'You are a professional writing assistant. Improve the following note by correcting grammar, ' +
  'improving clarity, and making it more professional. Preserve the original meaning and all ' +
  'factual information. Do not invent, assume, or add information that is not present. ' +
  'Return only the improved note text without explanations or markdown.';

export class AiServiceError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'AiServiceError';
    this.statusCode = statusCode;
  }
}

let client;

function getClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new AiServiceError('The AI service is not configured on the server.', 503);
  }
  if (!client) {
    client = new Groq({ apiKey, timeout: REQUEST_TIMEOUT_MS, maxRetries: 1 });
  }
  return client;
}

export async function improveNoteContent(content) {
  let completion;

  try {
    completion = await getClient().chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      max_completion_tokens: 2048,
      // A rewrite needs no deep reasoning, and this keeps latency and token use down.
      reasoning_effort: 'low',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content },
      ],
    });
  } catch (error) {
    throw toAiServiceError(error);
  }

  const improvedContent = completion.choices?.[0]?.message?.content?.trim();
  if (!improvedContent) {
    throw new AiServiceError('The AI service returned an unexpected response. Please try again.', 502);
  }
  return improvedContent;
}

function toAiServiceError(error) {
  if (error instanceof AiServiceError) {
    return error;
  }
  if (error instanceof RateLimitError) {
    return new AiServiceError('The AI service is rate limited. Please try again in a moment.', 429);
  }
  // Checked before APIConnectionError because the timeout error extends it.
  if (error instanceof APIConnectionTimeoutError) {
    return new AiServiceError('The AI service took too long to respond. Please try again.', 504);
  }
  if (error instanceof APIConnectionError) {
    return new AiServiceError('Could not reach the AI service. Please try again.', 503);
  }

  // Content is validated before the call, so a 4xx here points at the server key or setup.
  console.error('Groq request failed:', error?.status ?? '', error?.message);
  return new AiServiceError('The AI service is temporarily unavailable. Please try again.', 502);
}
