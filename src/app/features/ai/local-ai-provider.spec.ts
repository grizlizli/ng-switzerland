import { TestBed } from '@angular/core/testing';
import type { MLCEngineInterface } from '@mlc-ai/web-llm';
import { LOCAL_RUNTIME, LocalAiProvider } from './local-ai-provider';

describe('LocalAiProvider', () => {
  const create = vi.fn();
  const dispose = vi.fn();
  const runtime = vi.fn();
  beforeEach(() => {
    create.mockReset();
    dispose.mockReset();
    runtime.mockReset();
    runtime.mockImplementation(() => ({
      engine: Promise.resolve({
        chat: { completions: { create } },
      } as unknown as MLCEngineInterface),
      dispose,
    }));
    TestBed.configureTestingModule({ providers: [{ provide: LOCAL_RUNTIME, useValue: runtime }] });
  });
  it('initializes only on first chat, reuses the engine, and sends independent prompts', async () => {
    const provider = TestBed.inject(LocalAiProvider);
    expect(runtime).not.toHaveBeenCalled();
    create.mockResolvedValue({ choices: [{ message: { content: 'local answer' } }] });
    const progress = vi.fn();
    expect(await provider.chat('one', undefined, progress)).toBe('local answer');
    await provider.chat('two');
    expect(runtime).toHaveBeenCalledOnce();
    expect(create.mock.calls[1][0].messages).toEqual([{ role: 'user', content: 'two' }]);
    expect(progress).toHaveBeenCalledWith('Generating on your device…');
    TestBed.resetTestingModule();
    expect(dispose).toHaveBeenCalledOnce();
  });
  it('disposes a failed engine and allows retry', async () => {
    runtime.mockReturnValueOnce({ engine: Promise.reject(new Error('Download failed')), dispose });
    const provider = TestBed.inject(LocalAiProvider);
    await expect(provider.chat('one')).rejects.toThrow('Download failed');
    expect(dispose).toHaveBeenCalledOnce();
    create.mockResolvedValue({ choices: [{ message: { content: 'recovered' } }] });
    expect(await provider.chat('two')).toBe('recovered');
    expect(runtime).toHaveBeenCalledTimes(2);
  });
  it('prevents simultaneous generation across chat instances', async () => {
    let finish!: (value: unknown) => void;
    create.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const provider = TestBed.inject(LocalAiProvider);
    const first = provider.chat('one');
    await Promise.resolve();
    await expect(provider.chat('two')).rejects.toThrow('busy');
    finish({ choices: [{ message: { content: 'done' } }] });
    expect(await first).toBe('done');
  });
  it('provides an actionable error without WebGPU', async () => {
    TestBed.resetTestingModule();
    vi.stubGlobal('navigator', {});
    try {
      await expect(TestBed.inject(LocalAiProvider).chat('hello')).rejects.toThrow(
        'requires WebGPU',
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
