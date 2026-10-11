# AI-Powered Notes Manager

A MERN stack notes app with an AI-powered "Improve with AI" action that rewrites a note to be clearer and more professional.

## Features

- Create, view, edit and delete notes (title, content, created date, updated date)
- Improve note content with AI, with an undo for the AI rewrite
- Search notes by title
- Loading states, inline validation and readable error messages
- Responsive two-column layout that collapses on small screens

## Technologies used

**Frontend:** React 19, Vite, Axios
**Backend:** Node.js, Express 5, Mongoose 8, MongoDB
**AI:** Groq (`openai/gpt-oss-120b`) via the `groq-sdk` package, server side only

Groq was chosen because it offers a free API tier with no credit card required, and its inference is
fast enough that the "Improve with AI" button feels responsive.

## Architecture

```
React frontend -> Express API -> AI service -> Groq API
```

The API key lives only in the backend environment. The browser never calls the AI provider directly,
and all provider-specific code is isolated in `backend/src/services/ai.service.js`. The rest of the
app only depends on `improveNoteContent(content)`, so swapping providers touches one file.

## Project structure

```
backend/
  src/
    config/db.js               MongoDB connection
    models/note.model.js       Note schema (timestamps provide created/updated dates)
    controllers/               Request handlers for notes and AI
    routes/                    Express routers
    middleware/                Note validation and central error handling
    services/ai.service.js     The only file that knows which AI provider is used
    app.js                     Express app setup
    server.js                  Entry point
frontend/
  src/
    api/notesApi.js            Axios client for the backend
    components/                NoteForm, NoteList, NoteItem
    App.jsx                    Page state and data loading
```

## Prerequisites

- Node.js 18 or newer (developed on Node 24)
- A running MongoDB instance (local or MongoDB Atlas)
- A free Groq API key from https://console.groq.com/keys

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | Port the API listens on | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/ai-powered-notes` |
| `CORS_ORIGIN` | Origin allowed to call the API | `http://localhost:5173` |
| `GROQ_API_KEY` | Groq API key (required for the AI feature) | none |
| `GROQ_MODEL` | Optional model override | `openai/gpt-oss-120b` |

Model availability differs between Groq accounts. If the AI call fails and the server logs a
`model_not_found` error, list the models your key can use and set `GROQ_MODEL` to one of them:

```bash
curl -H "Authorization: Bearer $GROQ_API_KEY" https://api.groq.com/openai/v1/models
```

Without `GROQ_API_KEY` the notes app works normally and the AI endpoint returns a clear
"AI service is not configured" error.

Run it:

```bash
npm run dev     # restarts on file changes
npm start       # plain start
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000/api` |

Open http://localhost:5173.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/notes` | List notes, newest update first. Optional `?search=` filters by title |
| `POST` | `/api/notes` | Create a note from `{ title, content }` |
| `PUT` | `/api/notes/:id` | Update a note |
| `DELETE` | `/api/notes/:id` | Delete a note |
| `POST` | `/api/ai/improve-note` | Improve `{ content }` with AI |

Every response uses the same envelope:

```json
{ "success": true, "data": { } }
{ "success": false, "message": "Title is required" }
```

### Example

```bash
curl -X POST http://localhost:5000/api/ai/improve-note \
  -H "Content-Type: application/json" \
  -d '{"content":"meeting with client tomorrow discuss project"}'
```

```json
{
  "success": true,
  "data": {
    "improvedContent": "Schedule a meeting with the client tomorrow to discuss the project requirements and next steps."
  }
}
```

## Validation and error handling

- Title and content are required and trimmed, and are length-capped (120 / 10000 characters) in both
  the request middleware and the Mongoose schema
- AI content is validated before any request leaves the server
- AI failures are mapped to clean responses: `429` rate limited, `504` timeout, `503` unreachable
  or unconfigured, `502` for anything else. The raw cause is logged on the server only
- If the AI call fails, the frontend shows the message and leaves the user's original content untouched
