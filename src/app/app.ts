import { Component, signal, ChangeDetectionStrategy, inject, Injectable } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Ai, AI_MODEL } from './features/ai/ai';
import { form, FormField } from '@angular/forms/signals';

@Injectable()
export class AppStore {
  readonly ai = inject(Ai);
  readonly #model = inject(AI_MODEL);

  readonly #prompt = signal('');
  readonly #title = signal('NG Switzerland by Grizli Zli');

  readonly title = this.#title.asReadonly();

  readonly aiModel = form(this.#model);
  readonly aiPrompt = form(this.#prompt);

  readonly #messages = signal<string[]>([]);

  readonly messages = this.#messages.asReadonly();

  async chat(prompt: string): Promise<void> {
    const result = await this.ai.chat(prompt);
    this.#messages.update((m) => [...m, result]);
  }
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormField, FormField],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.css',
  providers: [AppStore],
})
export class App {
  readonly store = inject(AppStore);
}
