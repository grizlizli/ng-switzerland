import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { AppStore } from './app-store';
import { Ai } from './features/ai/ai';
import { provideAi } from './features/ai/provide-ai';

describe('AppStore', () => {
  const chat = vi.fn<(prompt: string) => Promise<string>>();
  beforeEach(() => {
    chat.mockReset();
    TestBed.configureTestingModule({
      providers: [provideAi(), AppStore, { provide: Ai, useValue: { chat } }],
    });
  });

  it('rejects empty prompts and duplicate submissions while preserving a new draft', async () => {
    const store = TestBed.inject(AppStore);
    store.promptField().value.set('  ');
    await store.send();
    expect(chat).not.toHaveBeenCalled();
    let resolve!: (response: string) => void;
    chat.mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    store.promptField().value.set(' hello ');
    const request = store.send();
    expect(store.pending()).toBe(true);
    await store.send();
    expect(chat).toHaveBeenCalledExactlyOnceWith('hello');
    store.promptField().value.set('new draft');
    store.providerField().value.set('gemini');
    resolve('answer');
    await request;
    expect(store.messages()).toEqual([
      { id: 0, provider: 'openai', prompt: 'hello', response: 'answer' },
    ]);
    expect(store.promptField().value()).toBe('new draft');
    expect(store.pending()).toBe(false);
  });

  it('retains failed prompts and allows a successful retry', async () => {
    const store = TestBed.inject(AppStore);
    store.promptField().value.set('hello');
    chat.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce('answer');
    await store.send();
    expect(store.error()).toBeTruthy();
    expect(store.pending()).toBe(false);
    expect(store.promptField().value()).toBe('hello');
    expect(store.messages()).toEqual([]);
    await store.send();
    expect(store.error()).toBeNull();
    expect(store.messages()).toHaveLength(1);
    expect(store.promptField().value()).toBe('');
  });
});
