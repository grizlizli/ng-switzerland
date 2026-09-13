import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
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
}
