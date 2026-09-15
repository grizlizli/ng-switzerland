import { Component, inject } from '@angular/core';
import { form, FormField, maxLength } from '@angular/forms/signals';
import { AppStore } from './app-store';
import { provideAi } from './features/ai/provide-ai';

@Component({
  selector: 'app-root',
  imports: [FormField],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [provideAi(), AppStore],
})
export class App {
  protected readonly store = inject(AppStore);
  protected readonly providerField = form(this.store.provider);
  protected readonly modelField = form(this.store.model);
  protected readonly promptField = form(this.store.prompt, (path) => maxLength(path, 8000));
}
