export interface AiProvider {
  chat(prompt: string, model?: string, onProgress?: (status: string) => void): Promise<string>;
}

export type AiProviderId = 'openai' | 'local';
export type AiProviderLoader = () => Promise<AiProvider>;

export const AI_PROVIDER_OPTIONS = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'local', label: 'Local AI' },
] as const satisfies readonly { id: AiProviderId; label: string }[];

export const OPENAI_MODELS = [
  { id: 'gpt-4.1-mini', label: 'GPT-4.1 mini' },
  { id: 'gpt-5-mini', label: 'GPT-5 mini' },
] as const;

export const LOCAL_MODEL = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';
