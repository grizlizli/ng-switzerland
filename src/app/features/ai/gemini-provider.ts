import { Service } from '@angular/core';
import type { AiProvider } from './ai-provider';

@Service()
export class GeminiProvider implements AiProvider {
  async chat(prompt: string): Promise<string> {
    return `gemini: ${prompt}`;
  }
}
