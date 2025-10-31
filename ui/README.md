# Denver Permit Assistant (Node.js + Vue)

Denver Permitting Agent UI - for demo purposes only

## Features

- **Agent bootstrap** from the sidebar (configurable Llama Stack host/port)
- **Permit application intake** with an AI-generated scorecard
- **RAG-backed Q&A** about Denver food truck regulations
- **Evaluation history** identical to the Streamlit experience

## Prerequisites

- Node.js 18+
- Access to a running Llama Stack server

Create a `.env` file (or export environment variables) to supply provider configuration:

```bash
LLAMA_STACK_ENDPOINT=http://localhost:8321
LLAMA_STACK_API_KEY=
FIREWORKS_API_KEY=
TOGETHER_API_KEY=
SAMBANOVA_API_KEY=
OPENAI_API_KEY=
TAVILY_SEARCH_API_KEY=
```

Only `LLAMA_STACK_ENDPOINT` is required; API keys are optional. If your Llama Stack server is available over HTTPS, set the endpoint with an `https://` URL; the sidebar protocol selector in the UI will pick that up so calls to the stack stay encrypted end-to-end.

## Install

```bash
npm install
```

## Development

Run both the Express proxy and the Vite dev server:

```bash
npm run dev
```

- Vite serves the Vue client on <http://localhost:5173>
- Express proxy listens on <http://localhost:5174> and forwards `/api/*` calls to your Llama Stack server, including provider headers when configured

## Production Build

```bash
npm run build
```

- Bundled assets are written to `dist/`
- Start only the proxy (for production) with:
  ```bash
  npm run dev:server
  ```
- Serve `dist/` with a static file host of your choice

## Project Structure

```
server/              # Express proxy + RAG helper logic (document ingestion, chat, evaluation)
src/                 # Vue 3 client replicating the Streamlit UI
  services/          # Axios wrappers for initialize/query/evaluate/reset
  App.vue            # Single-page layout matching the Streamlit design
  style.css          # Dark theme styling modeled after Streamlit
```

## Notes

- Document ingestion downloads the same Denver PDF regulations; a fallback text corpus is used when downloads fail.
- Vector DB setup, RAG queries, and evaluations follow the original Streamlit flow via Llama Stack REST endpoints.
- All evaluation history is kept client-side (in-memory), mirroring the Streamlit session behaviour.
