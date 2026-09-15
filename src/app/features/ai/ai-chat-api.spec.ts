import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AI_API_URL } from './ai-chat-api';
import { OpenAiProvider } from './open-ai-provider';

describe('AI HTTP transport', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AI_API_URL, useValue: '/api' },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('sends the chosen OpenAI model and extracts the response', async () => {
    const result = TestBed.inject(OpenAiProvider).chat('hello', 'gpt-5-mini');
    const request = http.expectOne('/api/chat');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      provider: 'openai',
      prompt: 'hello',
      model: 'gpt-5-mini',
    });
    request.flush({ provider: 'openai', model: 'gpt-5-mini', mock: false, response: 'answer' });
    expect(await result).toBe('answer');
  });
  it('shows actionable backend errors without returning a fake response', async () => {
    const result = TestBed.inject(OpenAiProvider).chat('hello');
    const rejected = expect(result).rejects.toThrow('OPENAI_API_KEY');
    http
      .expectOne('/api/chat')
      .flush({ message: 'private details' }, { status: 503, statusText: 'Unavailable' });
    await rejected;
  });
  it.each([
    ['OPENAI_QUOTA_EXCEEDED', 'billing'],
    ['OPENAI_RATE_LIMITED', 'OpenAI rate limit'],
    ['API_RATE_LIMITED', 'Local API limit'],
  ])('explains %s separately', async (code, message) => {
    const result = TestBed.inject(OpenAiProvider).chat('hello');
    const rejected = expect(result).rejects.toThrow(message);
    http.expectOne('/api/chat').flush({ code }, { status: 429, statusText: 'Too Many Requests' });
    await rejected;
  });
  it('rejects malformed responses', async () => {
    const result = TestBed.inject(OpenAiProvider).chat('hello');
    const rejected = expect(result).rejects.toThrow('invalid response');
    http.expectOne('/api/chat').flush({ unexpected: true });
    await rejected;
  });
});
