import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi } from 'vitest';
import { Ai } from './ai';
import { AI_PROVIDER_LOADER } from './ai-provider-loader';
import { AI_PROVIDER_SELECTION } from './ai-provider-selection';
import { provideAi } from './provide-ai';
import type { AiProvider } from './ai-provider';

describe('Ai', () => {
  it('switches providers and reuses the loaded service', async () => {
    TestBed.configureTestingModule({ providers: [provideAi()] });
    const ai = TestBed.inject(Ai);
    const selection = TestBed.inject(AI_PROVIDER_SELECTION);
    const loader = TestBed.inject(AI_PROVIDER_LOADER);
    const openai = await loader()();
    expect(await ai.chat('first')).toBe('openai: first');
    selection.set('gemini');
    expect(await ai.chat('second')).toBe('gemini: second');
    selection.set('openai');
    expect(await loader()()).toBe(openai);
  });

  it('keeps selections independent between chat injectors', async () => {
    const parent = TestBed.inject(Injector);
    const first = Injector.create({ providers: provideAi(), parent });
    const second = Injector.create({ providers: provideAi(), parent });
    try {
      first.get(AI_PROVIDER_SELECTION).set('gemini');
      expect(await first.get(Ai).chat('one')).toBe('gemini: one');
      expect(await second.get(Ai).chat('two')).toBe('openai: two');
    } finally {
      first.destroy();
      second.destroy();
    }
  });

  it('does not invoke loaders until chat and captures the loader before awaiting', async () => {
    let resolve!: (provider: AiProvider) => void;
    const first = vi.fn(
      () =>
        new Promise<AiProvider>((done) => {
          resolve = done;
        }),
    );
    const second = vi.fn(async () => ({ chat: async () => 'second' }));
    const selected = signal<() => Promise<AiProvider>>(first);
    TestBed.configureTestingModule({
      providers: [Ai, { provide: AI_PROVIDER_LOADER, useValue: selected }],
    });
    const ai = TestBed.inject(Ai);
    expect(first).not.toHaveBeenCalled();
    const request = ai.chat('hello');
    selected.set(second);
    resolve({ chat: async () => 'first' });
    expect(await request).toBe('first');
    expect(second).not.toHaveBeenCalled();
    expect(await ai.chat('next')).toBe('second');
  });

  it('propagates loader failures to its caller', async () => {
    const error = new Error('Chunk unavailable');
    TestBed.configureTestingModule({
      providers: [
        Ai,
        {
          provide: AI_PROVIDER_LOADER,
          useValue: signal(async () => {
            throw error;
          }),
        },
      ],
    });
    await expect(TestBed.inject(Ai).chat('hello')).rejects.toBe(error);
  });
});
