import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { form, FormField, maxLength, required, submit, validate } from '@angular/forms/signals';
import { AI_API_URL } from '../ai/ai-chat-api';
import { AiChatStore } from './ai-chat-store';
import { MAX_PROMPT_LENGTH } from './chat-message';

@Component({
  selector: 'app-chat-composer',
  imports: [FormField],
  templateUrl: './chat-composer.html',
  styleUrl: './chat-composer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComposer {
  protected readonly usesApi = !!inject(AI_API_URL);
  protected readonly store = inject(AiChatStore);
  protected readonly maxPromptLength = MAX_PROMPT_LENGTH;
  protected readonly providerField = form(this.store.provider);
  protected readonly modelField = form(this.store.model);
  protected readonly promptField = form(this.store.prompt, (path) => {
    required(path);
    validate(path, ({ value }) =>
      value().length > 0 && value().trim().length === 0
        ? { kind: 'whitespace', message: 'Enter a prompt with more than whitespace.' }
        : null,
    );
    maxLength(path, MAX_PROMPT_LENGTH);
  });

  protected send(event: Event): void {
    event.preventDefault();
    void submit(this.promptField, async () => {
      await this.store.send();
    });
  }
}
