import type { Provider } from '@angular/core';
import { provideAi } from '../ai/provide-ai';
import { AiChatStore } from './ai-chat-store';

export function provideAiChat(): Provider[] {
  return [provideAi(), AiChatStore];
}
