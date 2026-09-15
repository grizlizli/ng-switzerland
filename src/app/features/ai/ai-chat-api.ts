import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, InjectionToken } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export const AI_API_URL = new InjectionToken<string | null>('AI_API_URL', {
  factory: () => environment.apiUrl,
});
type ChatTransport = (provider: 'openai', prompt: string, model?: string) => Promise<string>;

export const AI_CHAT_TRANSPORT = new InjectionToken<ChatTransport>('AI_CHAT_TRANSPORT', {
  factory: () => {
    const apiUrl = inject(AI_API_URL);
    if (!apiUrl) return async (provider, prompt) => `${provider}: ${prompt}`;
    const http = inject(HttpClient);
    return async (provider, prompt, model) => {
      try {
        const body = { provider, prompt, model: model ?? 'gpt-4.1-mini' };
        const result = await firstValueFrom(
          http.post<unknown>(`${apiUrl}/chat`, body, { timeout: 35000 }),
        );
        if (
          !result ||
          typeof result !== 'object' ||
          !('response' in result) ||
          typeof result.response !== 'string'
        ) {
          throw new Error('The API returned an invalid response.');
        }
        return result.response;
      } catch (error) {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 0)
            throw new Error('Cannot reach the AI API. Check that the backend is running.');
          if (error.status === 429) {
            const code = (error.error as { code?: unknown } | null)?.code;
            if (code === 'OPENAI_QUOTA_EXCEEDED')
              throw new Error(
                'OpenAI API quota is exhausted. Check your API billing and usage limits.',
              );
            if (code === 'OPENAI_RATE_LIMITED')
              throw new Error('OpenAI rate limit reached. Please try again later.');
            if (code === 'API_RATE_LIMITED')
              throw new Error(
                'Local API limit reached (20 requests/minute). Wait a minute before retrying.',
              );
          }
          const messages: Record<number, string> = {
            400: 'The API rejected this prompt or model.',
            429: 'Too many requests. Please try again later.',
            502: 'The AI provider could not complete the request. Please try again.',
            503: 'OpenAI is not configured. Set OPENAI_API_KEY in the backend.',
            504: 'The AI request timed out. Please try again.',
          };
          throw new Error(messages[error.status] ?? 'The AI request failed. Please try again.');
        }
        throw error;
      }
    };
  },
});
