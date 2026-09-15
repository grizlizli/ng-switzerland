import { AI_API_URL } from './ai-chat-api';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OpenAiProvider } from './open-ai-provider';

describe('OpenAiProvider', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: AI_API_URL, useValue: null }] });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('returns a local mock response without making network requests', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    expect(await TestBed.inject(OpenAiProvider).chat('Hello')).toBe('openai: Hello');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
