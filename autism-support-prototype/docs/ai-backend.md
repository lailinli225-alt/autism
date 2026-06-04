# AI Backend

This prototype now uses a backend model call instead of fixed frontend answers.

## API

- Endpoint: `POST /api/analyze`
- Runtime: Vercel Serverless Function
- Secret: `OPENAI_API_KEY`
- Optional model override: `OPENAI_MODEL`

The frontend sends the current child case to `/api/analyze`. The backend loads the five autism intervention skills from `src/data/autismInterventionSkills.js`, calls OpenAI Responses API, and returns a structured report for the UI.

## Local setup

Create `.env.local`:

```bash
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-5.5
```

For local API testing, run the app with Vercel dev or another Node server that can serve `api/analyze.js`. Plain `npm run dev` only starts Vite and does not run the API route.

## Online deployment

GitHub Pages is static and cannot run `/api/analyze`. Use one of these:

1. Deploy the whole project to Vercel and set `OPENAI_API_KEY` in Vercel environment variables.
2. Keep GitHub Pages for the frontend, deploy the API elsewhere, and set `VITE_API_BASE_URL` to that API origin at build time.

Never put `OPENAI_API_KEY` in frontend code or GitHub Pages environment variables.
