import { TestBed } from '@angular/core/testing';
import { GeminiProvider } from './gemini-provider';

describe('GeminiProvider', () => {
  let service: GeminiProvider;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeminiProvider);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
