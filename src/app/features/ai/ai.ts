import { computed, inject, InjectionToken, signal, Signal, WritableSignal } from '@angular/core';
import { OpenAiProvider } from './open-ai-provider';

export interface AiProvder {
  chat(prompt: string): Promise<string>;
}

const AI_MODEL = new InjectionToken<Signal<string> | WritableSignal<string>>('AI_MODEL', {
  factory: () => signal<'openai' | 'gemini'>('openai'),
});

const AI_PROVIDER = new InjectionToken<unknown>('AI_PROVIDER', {
  factory: () => {
    const model = inject(AI_MODEL);

    return computed(() => {
      switch (model()) {
        case 'openai':
          return;
        default:
          return OpenAiProvider;
      }
    });
  },
});
