import { TestBed } from '@angular/core/testing';

import { OpenAiProvider } from './open-ai-provider';

describe('OpenAiProvider', () => {
  let service: OpenAiProvider;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenAiProvider);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
