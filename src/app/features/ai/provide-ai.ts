import { signal, type Provider } from '@angular/core';
import { Ai } from './ai';
import type { AiProviderId } from './ai-provider';
import { AI_PROVIDER_LOADER, createAiProviderLoader } from './ai-provider-loader';
import { AI_PROVIDER_SELECTION } from './ai-provider-selection';

// Register the entire selection chain together so each chat can be independent.
// Concrete, stateless providers remain auto-provided and lazily loaded.
export function provideAi(initialProvider: AiProviderId = 'openai'): Provider[] {
  return [
    Ai,
    { provide: AI_PROVIDER_SELECTION, useFactory: () => signal(initialProvider) },
    { provide: AI_PROVIDER_LOADER, useFactory: createAiProviderLoader },
  ];
}
