import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Ai, AI_MODEL } from './features/ai/ai';
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormField, FormField],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.css',
})
export class App {
  readonly ai = inject(Ai);
  readonly #model = inject(AI_MODEL);
  readonly #prompt = signal('');

  protected readonly title = signal('ng-switzerland');

  readonly aiModel = form(this.#model);
  readonly aiPrompt = form(this.#prompt);

  readonly #messages = signal<string[]>([]);

  readonly messages = this.#messages.asReadonly();

  async chat(prompt: string): Promise<void> {
    const result = await this.ai.chat(prompt);
    this.#messages.update((m) => [...m, result]);
  }
}
