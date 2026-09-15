export interface AiProvider {
  chat(prompt: string, model?: string): Promise<string>;
}

export type AiProviderId = 'openai' | 'gemini';
export type AiProviderLoader = () => Promise<AiProvider>;

export const AI_PROVIDER_OPTIONS = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'gemini', label: 'Gemini' },
] as const satisfies readonly { id: AiProviderId; label: string }[];

export const OPENAI_MODELS = [
  { id: 'gpt-4.1-mini', label: 'GPT-4.1 mini' },
  { id: 'gpt-5-mini', label: 'GPT-5 mini' },
] as const;
