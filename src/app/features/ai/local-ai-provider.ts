import { DestroyRef, inject, InjectionToken, Service } from '@angular/core';
import type { MLCEngineInterface } from '@mlc-ai/web-llm';
import { LOCAL_MODEL, type AiProvider } from './ai-provider';

type Progress = (status: string) => void;
export interface LocalRuntime {
  engine: Promise<MLCEngineInterface>;
  dispose(): void;
}
export const LOCAL_RUNTIME = new InjectionToken<(progress: Progress) => LocalRuntime>(
  'LOCAL_RUNTIME',
  {
    factory: () => (progress) => {
      if (
        typeof navigator === 'undefined' ||
        !('gpu' in navigator) ||
        typeof Worker === 'undefined'
      ) {
        throw new Error(
          'Local AI requires WebGPU and Web Workers. Try a WebGPU-enabled browser, or select OpenAI.',
        );
      }
      const worker = new Worker(new URL('./local-ai.worker', import.meta.url), { type: 'module' });
      const failed = new Promise<never>((_, reject) => {
        worker.onerror = () => reject(new Error('Local AI worker failed. Please retry.'));
      });
      const engine = import('@mlc-ai/web-llm').then(({ CreateWebWorkerMLCEngine }) =>
        CreateWebWorkerMLCEngine(
          worker,
          LOCAL_MODEL,
          {
            initProgressCallback: ({ progress: value }) =>
              progress(`Preparing local model: ${Math.round(value * 100)}%`),
          },
          { context_window_size: 4096 },
        ),
      );
      return { engine: Promise.race([engine, failed]), dispose: () => worker.terminate() };
    },
  },
);

@Service()
export class LocalAiProvider implements AiProvider {
  readonly #createRuntime = inject(LOCAL_RUNTIME);
  readonly #destroyRef = inject(DestroyRef);
  #runtime?: LocalRuntime;
  #busy = false;

  constructor() {
    this.#destroyRef.onDestroy(() => this.#reset());
  }

  async chat(prompt: string, _model?: string, onProgress: Progress = () => {}): Promise<string> {
    if (this.#busy) throw new Error('Local AI is busy with another conversation. Please wait.');
    this.#busy = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      onProgress(this.#runtime ? 'Preparing local response…' : 'Loading local AI engine…');
      this.#runtime ??= this.#createRuntime(onProgress);
      const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error('Local AI timed out. Check your connection and GPU, then retry.')),
          300000,
        );
      });
      const result = await Promise.race([
        this.#generate(this.#runtime, prompt, onProgress),
        timeout,
      ]);
      return result;
    } catch (error) {
      this.#reset();
      throw error instanceof Error
        ? error
        : new Error('Local AI failed to load or generate. Please retry.');
    } finally {
      clearTimeout(timer);
      this.#busy = false;
    }
  }

  async #generate(runtime: LocalRuntime, prompt: string, progress: Progress): Promise<string> {
    const engine = await runtime.engine;
    if (this.#destroyRef.destroyed) throw new Error('Local AI was closed.');
    progress('Generating on your device…');
    const result = await engine.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 512,
      stream: false,
    });
    const text = result.choices[0]?.message.content;
    if (!text?.trim()) throw new Error('Local AI returned an empty response. Please retry.');
    return text;
  }

  #reset(): void {
    this.#runtime?.dispose();
    this.#runtime = undefined;
  }
}
