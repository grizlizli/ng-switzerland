import { Injectable, Service } from '@angular/core';
import { AiProvider } from './ai';

@Service()
export class GeminiProvider implements AiProvider {
  async chat(prompt: string): Promise<string> {
    return await `gemini: ${prompt}`;
  }
}
