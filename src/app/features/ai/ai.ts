import { inject, Injectable } from '@angular/core';
import type { AiProvider } from './ai-provider';
import { AI_PROVIDER_LOADER } from './ai-provider-loader';

@Injectable()
export class Ai implements AiProvider {
  readonly #provider = inject(AI_PROVIDER_LOADER);

  async chat(prompt: string, model?: string): Promise<string> {
    // Capture the selection before awaiting: a pending request keeps its provider.
    const loadProvider = this.#provider();
    const provider = await loadProvider();
    return provider.chat(prompt, model);
  }
}
