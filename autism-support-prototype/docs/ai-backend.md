# AI Backend

This prototype now uses a backend model call instead of fixed frontend answers.

## API

- Endpoint: `POST /api/analyze`
- Runtime: Vercel Serverless Function
- OpenAI secret: `OPENAI_API_KEY`
- DeepSeek secret: `DEEPSEEK_API_KEY`
- Provider switch: `AI_PROVIDER=openai` or `AI_PROVIDER=deepseek`

The frontend sends the current child case to `/api/analyze`. The backend loads the five autism intervention skills from `src/data/autismInterventionSkills.js`, calls the configured model provider, and returns a structured report for the UI.

## Local setup

Create `.env.local`:

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-5-mini
```

For DeepSeek:

```bash
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
DEEPSEEK_MODEL=deepseek-v4-flash
```

For local API testing, run the app with Vercel dev or another Node server that can serve `api/analyze.js`. Plain `npm run dev` only starts Vite and does not run the API route.

## Online deployment

GitHub Pages is static and cannot run `/api/analyze`. Use one of these:

1. Deploy the whole project to Vercel and set `OPENAI_API_KEY` in Vercel environment variables.
2. Keep GitHub Pages for the frontend, deploy the API elsewhere, and set `VITE_API_BASE_URL` to that API origin at build time.

For DeepSeek, set `AI_PROVIDER=deepseek` and `DEEPSEEK_API_KEY` instead of `OPENAI_API_KEY`.

Never put API keys in frontend code or GitHub Pages environment variables.
