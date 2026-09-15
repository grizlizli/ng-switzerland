import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Ai } from '../ai/ai';
import { AI_PROVIDER_OPTIONS, OPENAI_MODELS, LOCAL_MODEL } from '../ai/ai-provider';
import { AI_PROVIDER_SELECTION } from '../ai/ai-provider-selection';

import { MAX_PROMPT_LENGTH, type ChatMessage } from './chat-message';

@Injectable()
export class AiChatStore {
  readonly #ai = inject(Ai);
  readonly provider = inject(AI_PROVIDER_SELECTION);
  readonly #destroyRef = inject(DestroyRef);
  readonly prompt = signal('');
  readonly model = signal<string>('gpt-4.1-mini');
  readonly #messages = signal<ChatMessage[]>([]);
  readonly #pending = signal(false);
  readonly #progress = signal<string | null>(null);
  readonly progress = this.#progress.asReadonly();
  readonly #error = signal<string | null>(null);
  #nextMessageId = 0;

  readonly providerOptions = AI_PROVIDER_OPTIONS;
  readonly models = OPENAI_MODELS;
  readonly isOpenAi = computed(() => this.provider() === 'openai');
  readonly messages = this.#messages.asReadonly();
  readonly pending = this.#pending.asReadonly();
  readonly error = this.#error.asReadonly();
  readonly canSend = computed(
    () =>
      !this.#pending() &&
      this.prompt().trim().length > 0 &&
      this.prompt().length <= MAX_PROMPT_LENGTH,
  );

  async send(): Promise<void> {
    if (!this.canSend()) return;

    const draft = this.prompt();
    const prompt = draft.trim();
    const provider = this.provider();
    const model = provider === 'openai' ? this.model() : LOCAL_MODEL;
    this.#pending.set(true);
    this.#error.set(null);
    this.#progress.set(null);

    try {
      const response = await this.#ai.chat(prompt, model, (status) => {
        if (!this.#destroyRef.destroyed) this.#progress.set(status);
      });
      if (this.#destroyRef.destroyed) return;
      this.#messages.update((messages) => [
        ...messages,
        { id: this.#nextMessageId++, provider, model, prompt, response },
      ]);
      // Do not discard a new draft typed while the previous request was running.
      if (this.prompt() === draft) this.prompt.set('');
    } catch (error) {
      if (!this.#destroyRef.destroyed) {
        this.#error.set(
          error instanceof Error ? error.message : 'Unable to get a response. Please try again.',
        );
      }
    } finally {
      if (!this.#destroyRef.destroyed) {
        this.#pending.set(false);
        this.#progress.set(null);
      }
    }
  }
}
