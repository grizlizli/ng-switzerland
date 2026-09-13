import { computed, inject, injectAsync, InjectionToken, type Signal } from '@angular/core';
import type { AiProvider, AiProviderId, AiProviderLoader } from './ai-provider';
import { AI_PROVIDER_SELECTION } from './ai-provider-selection';

export const AI_PROVIDER_LOADER = new InjectionToken<Signal<AiProviderLoader>>(
  'AI_PROVIDER_LOADER',
);

export function createAiProviderLoader(): Signal<AiProviderLoader> {
  const selection = inject(AI_PROVIDER_SELECTION);
  const loaders = {
    openai: injectAsync<AiProvider>(() =>
      import('./open-ai-provider').then((m) => m.OpenAiProvider),
    ),
    gemini: injectAsync<AiProvider>(() =>
      import('./gemini-provider').then((m) => m.GeminiProvider),
    ),
  } satisfies Record<AiProviderId, AiProviderLoader>;

  return computed(() => loaders[selection()]);
}
