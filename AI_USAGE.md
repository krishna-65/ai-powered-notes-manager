# AI Usage

## 1. Which AI tools were used

- **Claude (Anthropic)** — used as a coding assistant while building the project.
- **Groq (`openai/gpt-oss-120b`)** — not a development tool, but the AI provider powering the
  "Improve with AI" feature at runtime. Chosen for its free tier.

## 2. Where AI was used during development

- Scaffolding the project structure (backend folders, Express setup, Vite + React setup).
- Checking the current Groq Node.js integration. Rather than copying a blog example, the SDK surface
  was verified against the installed `groq-sdk` type definitions before writing the service, which
  confirmed `max_completion_tokens` is the current parameter and `max_tokens` only a legacy alias.
- Drafting the error-mapping logic in `ai.service.js` (rate limits, timeouts, connection failures,
  empty responses).
- Writing the CSS layout and this documentation.

Code written with assistance was reviewed, tested against the running API, and adjusted by hand.
Three examples:

- An early draft mapped a provider `400` response straight through as a `400` to the client, which
  wrongly blames the user's note. Because content is already validated before the request, a `400`
  from the provider almost always means a server-side key or setup problem, so it now returns `502`
  and logs the real cause on the server.
- `APIConnectionTimeoutError` extends `APIConnectionError` in the SDK, so the timeout case has to be
  checked first or it would be swallowed by the generic connection branch.
- The first model chosen from Groq's published model list returned `404 model_not_found` at runtime,
  because model access varies per account. Querying `models.list()` with the real key showed what was
  actually available. The model is now an environment variable with a working default, so a future
  change needs a config edit rather than a code edit.

The AI provider was swapped once during development. Because all provider code is isolated in
`ai.service.js` behind a plain `improveNoteContent(content)` function, the swap meant rewriting that
one file and renaming the environment variable — no controller, route or frontend change.

## 3. Example prompt used

> Build the Express route and service for `POST /api/ai/improve-note`. The API key must stay on the
> server and all provider-specific code must live in `backend/src/services/ai.service.js`. Validate
> the content before calling the provider, reject empty or oversized input, and handle rate limits,
> timeouts, network failures and empty responses by returning a clean JSON error. Keep comments to a
> minimum and only where the logic is non-obvious.

## Prompt sent to the AI at runtime

The system prompt used by the feature, from `backend/src/services/ai.service.js`:

> You are a professional writing assistant. Improve the following note by correcting grammar,
> improving clarity, and making it more professional. Preserve the original meaning and all factual
> information. Do not invent, assume, or add information that is not present. Return only the
> improved note text without explanations or markdown.

Only the note content is sent to the provider — no titles, ids or other data.
