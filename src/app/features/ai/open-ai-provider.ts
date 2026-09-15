import { inject, Service } from '@angular/core';
import type { AiProvider } from './ai-provider';
import { AI_CHAT_TRANSPORT } from './ai-chat-api';

@Service()
export class OpenAiProvider implements AiProvider {
  readonly #chat = inject(AI_CHAT_TRANSPORT);

  chat(prompt: string, model?: string): Promise<string> {
    return this.#chat('openai', prompt, model);
  }
}
