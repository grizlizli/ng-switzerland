import { Injectable } from '@angular/core';
import { AiProvder } from './ai';

@Injectable({
  providedIn: 'root',
})
export class OpenAiProvider implements AiProvder {
  async chat(prompt: string): Promise<string> {
    return await prompt;
  }
}
