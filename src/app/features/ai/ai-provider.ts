export interface AiProvider {
  chat(prompt: string): Promise<string>;
}

export type AiProviderId = 'openai' | 'gemini';
export type AiProviderLoader = () => Promise<AiProvider>;

export const AI_PROVIDER_OPTIONS = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'gemini', label: 'Gemini' },
] as const satisfies readonly { id: AiProviderId; label: string }[];
