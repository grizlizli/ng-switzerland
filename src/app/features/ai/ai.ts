import {
  computed,
  inject,
  injectAsync,
  InjectionToken,
  Service,
  signal,
  type Signal,
  type WritableSignal,
} from '@angular/core';

export interface AiProvider {
  chat(prompt: string): Promise<string>;
}

export type AiModel = 'openai' | 'gemini';
export type AiProviderLoader = () => Promise<AiProvider>;

export const AI_MODEL = new InjectionToken<WritableSignal<AiModel>>('AI_MODEL', {
  factory: () => signal<AiModel>('openai'),
});

export const AI_PROVIDER = new InjectionToken<Signal<AiProviderLoader>>('AI_PROVIDER', {
  factory: () => {
    const model = inject(AI_MODEL);

    const openai = injectAsync<AiProvider>(() =>
      import('./open-ai-provider').then((m) => m.OpenAiProvider),
    );

    const gemini = injectAsync<AiProvider>(() =>
      import('./gemini-provider').then((m) => m.GeminiProvider),
    );

    return computed(() => {
      switch (model()) {
        case 'openai':
          return openai;
        case 'gemini':
          return gemini;
      }
    });
  },
});

@Service()
export class Ai implements AiProvider {
  readonly #provider = inject(AI_PROVIDER);

  async chat(prompt: string): Promise<string> {
    const loadProvider = this.#provider();
    const provider = await loadProvider();

    return provider.chat(prompt);
  }
}
