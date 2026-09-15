# NG Switzerland — Lazy AI providers

Angular 22 demo of lazy dependency injection with two materially different implementations:

- **OpenAI**: a small HTTP adapter calling the separate NestJS `ng-switzerland-api`.
- **Local AI**: WebLLM running Llama 3.2 1B (`Llama-3.2-1B-Instruct-q4f16_1-MLC`) in a Web Worker via WebGPU. No API key or backend inference.

## Run

```sh
nvm use 24.19.0
npm ci
npm start
```

Start the backend on `127.0.0.1:3000` for real OpenAI calls. Development forwards `/api/**` via `proxy.conf.json`. Only the backend holds `OPENAI_API_KEY`. Restart the dev server after changing Angular/worker/proxy configuration.

The production build keeps OpenAI in **mock mode** until a hosted API URL is configured in `src/environments/environment.ts`. Local AI is real in both configurations.

## Local AI

Use a WebGPU-capable browser with sufficient GPU memory on HTTPS or localhost. The first Local AI submission downloads the runtime, WebAssembly and model weights (hundreds of MB); initialization progress is shown in the composer. No download or GPU initialization occurs just by selecting the provider.

WebLLM manages its model cache independently of Angular's service worker. Later initialization may reuse that cache, but offline operation depends on all required resources remaining cached; browser storage eviction can require another download. Prepare the model on the presentation device before a talk.

A single root-scoped local runtime is reused. Concurrent generation from different chat instances is rejected while it is busy. Failed initialization/generation clears the runtime for retry. The worker is terminated on service destruction. A five-minute timeout bounds initialization and generation. Requests use a 4096-token context window and at most 512 generated tokens. Each prompt is independent; UI history is not sent as model context. Very long prompts may exceed the local token window even within the UI's character limit.

## Architecture

`App` owns the page shell. `features/ai-chat` contains the container, composer, transcript and store. Signal Forms stay in the composer; request guards and chat state stay in `AiChatStore`. `ChatTranscript` accepts signal inputs.

`provideAiChat()` composes `provideAi()` and the feature store. Selection and the AI facade are scoped to a chat instance; stateless OpenAI and the managed Local AI runtime are root-scoped. `computed` selects an `injectAsync` loader; `Ai.chat()` captures that loader before awaiting it. Changing selection during a request does not change its provider. New drafts are preserved when previous requests finish.

`LocalAiProvider` loads the WebLLM package only on demand. The worker imports its own runtime. JavaScript loading and model initialization are separate phases; progress callbacks describe initialization without coupling providers to UI signals.

## Talk / lazy-loading verification

1. Open Network tools in a fresh browser session and clear the log.
2. Send an OpenAI prompt: no local engine or model should be downloaded.
3. Select Local AI: still no engine initialization.
4. Submit a prompt: the lazy provider, WebLLM runtime/worker and model assets load.
5. Submit again: the initialized engine is reused.

The production PWA prefetches the main application bundle for offline startup. Other JavaScript assets use lazy cache installation, so selecting a cloud provider does not prefetch WebLLM. Those chunks become offline-capable only after first use. Do not statically import LocalAiProvider into app components.

## Prerendering and PWA

`npm run build` prerenders the home page with hydration/event replay. Deploy `dist/ng-switzerland/browser` as static files; no Express/SSR server runs in this frontend. `main.server.ts` is only a build entry point. WebGPU is accessed only on a Local AI request, never during prerendering.

`npm run preview:pwa -- --port 4300` runs the production configuration. The manifest supports installation; the service worker caches both prerendered `index.html` and `index.csr.html`. Conversation history remains in memory and resets on reload. Real OpenAI calls require a connection. New PWA versions activate on a subsequent reload.

Angular CLI persistent caching is disabled due to a native cache crash observed in this macOS environment.

## Verification

```sh
npm test -- --watch=false
npm run build
```

Tests exercise provider selection, independent chat scopes, form submission, HTTP errors and the local runtime lifecycle using test doubles. They do not download weights or prove GPU inference on every browser. Local runtime tests cover lazy initialization, reuse, retry, concurrency and unsupported browsers.

References: [WebLLM](https://webllm.mlc.ai/docs/), [Angular style guide](https://angular.dev/style-guide).

The install card appears when the browser fires `beforeinstallprompt`; installation requires an explicit click. iOS/iPadOS gets Share → Add to Home Screen instructions. Dismissal lasts for the browser session, and standalone mode hides the card. Test native installation in a supported browser using the production PWA preview or HTTPS deployment.

`PwaInstall` renders the installation card and delegates actions to `PwaPrompt`. `providePwaPromt()` registers the service in the component scope. The service owns read-only UI signals, browser events, session dismissal and installation; its listeners are removed when that scope is destroyed.
