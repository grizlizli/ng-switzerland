import type { AiProviderId } from '../ai/ai-provider';

export const MAX_PROMPT_LENGTH = 8000;

export interface ChatMessage {
  readonly id: number;
  readonly provider: AiProviderId;
  readonly prompt: string;
  readonly model?: string;
  readonly response: string;
}
