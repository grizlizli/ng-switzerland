import { Service } from '@angular/core';
import type { AiProvider } from './ai-provider';

@Service()
export class OpenAiProvider implements AiProvider {
  async chat(prompt: string): Promise<string> {
    return `openai: ${prompt}`;
  }
}
