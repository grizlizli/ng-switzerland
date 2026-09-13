# NgSwitzerland

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.24.

## Dynamic AI provider demo

`AppStore` owns the prompt, messages, pending state, and recoverable request errors.
`Ai.chat()` selects a loader, awaits the DI service, and forwards the prompt.
`AI_PROVIDER_LOADER` uses a computed signal to select between `injectAsync` loaders.
Changing the provider does not load it until the next request.

Register `provideAi()` alongside the chat store in the component's `providers`.
This scopes the selection, loader, and facade together. Separate chat instances
have independent selections; stateless concrete services remain auto-provided.
A request keeps the provider selected when it started, even if the user changes
the dropdown while awaiting a response.

The providers currently return mock responses. Provider identifiers are not model
identifiers; selecting multiple models per provider can be added to the request
contract when real integrations are introduced.

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
ng serve
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
