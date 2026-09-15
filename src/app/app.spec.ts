import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { AppStore } from './app-store';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('AI. ON YOURTERMS.');
  });
  it('binds component forms to store data in both directions', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const store = fixture.debugElement.injector.get(AppStore);
    const element = fixture.nativeElement as HTMLElement;
    const prompt = element.querySelector('textarea')!;
    const provider = element.querySelector<HTMLSelectElement>('#ai-provider')!;
    const model = element.querySelector<HTMLSelectElement>('#ai-model')!;

    expect(prompt.maxLength).toBe(8000);
    prompt.value = 'Hello Angular';
    prompt.dispatchEvent(new Event('input', { bubbles: true }));
    model.value = 'gpt-5-mini';
    model.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(store.prompt()).toBe('Hello Angular');
    expect(store.model()).toBe('gpt-5-mini');

    provider.value = 'gemini';
    provider.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(store.provider()).toBe('gemini');
    expect(element.querySelector('#ai-model')).toBeNull();

    store.prompt.set('Updated by the store');
    await fixture.whenStable();
    expect(prompt.value).toBe('Updated by the store');
  });
});
