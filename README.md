# NgSwitzerland

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.24.

## Dynamic AI provider demo

`AppStore` owns writable prompt/model/provider data, messages, pending state, and
recoverable request errors. `App` creates Signal Forms and field validation from
those signals; the store has no dependency on Angular Forms. The store retains
submission guards so calls from outside the UI also reject invalid prompts.
`Ai.chat()` selects a loader, awaits the DI service, and forwards the prompt.
`AI_PROVIDER_LOADER` uses a computed signal to select between `injectAsync` loaders.
Changing the provider does not load it until the next request.

Register `provideAi()` alongside the chat store in the component's `providers`.
This scopes the selection, loader, and facade together. Separate chat instances
have independent selections; stateless concrete services remain auto-provided.
A request keeps the provider selected when it started, even if the user changes
the dropdown while awaiting a response.

OpenAI and Gemini return local mock responses. The OpenAI model selector is kept
as frontend demo state; no external AI calls are made and no API key is required.
Backend integration will live in a separate repository. The frontend is prerendered at build time, hydrates in the browser, and has production-only PWA support.

To add a provider, extend `AiProviderId` and `AI_PROVIDER_OPTIONS`, implement
`AiProvider` in an auto-provided service, and add its dynamic import to the typed
loader registry. Avoid static imports of concrete providers in application code.

Tests cover provider switching, independent scopes, deferred loading, failures,
duplicate submission prevention, draft preservation, and request retry. A failed
dynamic import is cached by the current Angular `injectAsync` implementation;
a page reload may be needed to recover a failed chunk download. Provider request
failures can be retried without reloading.

## Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Prerendering and PWA

`npm start` runs without a service worker, so Network tools show the actual
lazy loading of providers. `npm run build` prerenders the initial page into HTML
and creates the static application in `dist/ng-switzerland/browser`. Angular
hydrates that HTML in the browser, with event replay enabled.

`outputMode: "static"` and `RenderMode.Prerender` keep server rendering at build
time. `main.server.ts` and the server config are build entry points, not a
running backend. No Express server or deployed Node.js process is required.

`npm run preview:pwa` runs the production configuration with the service worker.
Use a separate port/origin from the development demo to avoid old workers, e.g.
`npm run preview:pwa -- --port 4300`. PWA installation requires HTTPS (Vercel) or
localhost. Install from your browser's install menu; on iOS use Share → Add to
Home Screen. Browser support and install UI vary.

After the first online visit finishes installing the worker and caching the app,
the UI and both mock providers work offline. The worker caches both the
prerendered `index.html` and Angular’s `index.csr.html` navigation fallback. Production precaches all JS chunks,
including providers; the development build still demonstrates on-demand loading.
Conversation messages remain in memory and reset after a reload. PWA support does
not add persistence or enable future remote AI calls to run offline.

New versions download in the background and are used on a subsequent reload.
Close and reopen the app if an older version is still active. The Vercel config
sets static output, SPA navigation fallback, and revalidation for worker metadata.

Offline verification: build, serve the output on localhost, open it and wait for
service-worker activation, reload once, then stop the static server and reload.
Confirm that the page and both mock providers still work. Use a fresh origin or
clear site data when testing a first install.

Angular CLI persistent caching is disabled in this project because its native
cache crashed during production builds in the local macOS environment. Revisit
this workaround after updating the affected build tooling.
