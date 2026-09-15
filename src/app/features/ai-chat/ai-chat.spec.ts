import { TestBed } from '@angular/core/testing';
import { AiChat } from './ai-chat';
import { AiChatStore } from './ai-chat-store';

describe('AiChat', () => {
  it('binds component forms to store data in both directions', async () => {
    const fixture = TestBed.createComponent(AiChat);
    await fixture.whenStable();
    const store = fixture.debugElement.injector.get(AiChatStore);
    const element = fixture.nativeElement as HTMLElement;
    const prompt = element.querySelector('textarea')!;
    const provider = element.querySelector<HTMLSelectElement>('#ai-provider')!;
    const model = element.querySelector<HTMLSelectElement>('#ai-model')!;

    expect(prompt.required).toBe(true);
    expect(prompt.validity.valueMissing).toBe(true);
    expect(prompt.maxLength).toBe(8000);
    prompt.value = 'Hello Angular';
    prompt.dispatchEvent(new Event('input', { bubbles: true }));
    model.value = 'gpt-5-mini';
    model.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(store.prompt()).toBe('Hello Angular');
    expect(prompt.validity.valueMissing).toBe(false);
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
  it('disables submission for invalid prompts and while a request is pending', async () => {
    const fixture = TestBed.createComponent(AiChat);
    await fixture.whenStable();
    const store = fixture.debugElement.injector.get(AiChatStore);
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    for (const prompt of ['', ' \n\t ', 'a'.repeat(8001)]) {
      store.prompt.set(prompt);
      await fixture.whenStable();
      expect(button.disabled).toBe(true);
    }
    store.prompt.set('Valid prompt');
    await fixture.whenStable();
    expect(button.disabled).toBe(false);
    const request = store.send();
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
    await request;
    await fixture.whenStable();
    expect(button.disabled).toBe(true);
  });

  it('validates keyboard submissions before invoking the store', async () => {
    const fixture = TestBed.createComponent(AiChat);
    await fixture.whenStable();
    const store = fixture.debugElement.injector.get(AiChatStore);
    const send = vi.spyOn(store, 'send').mockResolvedValue(undefined);
    const prompt = (fixture.nativeElement as HTMLElement).querySelector('textarea')!;
    prompt.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    await fixture.whenStable();
    expect(send).not.toHaveBeenCalled();
    prompt.value = 'Valid keyboard prompt';
    prompt.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    prompt.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    await fixture.whenStable();
    expect(send).toHaveBeenCalledOnce();
  });

  it('submits the composer and renders the response in the transcript', async () => {
    const fixture = TestBed.createComponent(AiChat);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const prompt = element.querySelector('textarea')!;
    prompt.value = 'Hello from the composer';
    prompt.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    element
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    await expect
      .poll(async () => {
        await fixture.whenStable();
        return element.querySelector('app-chat-transcript')?.textContent;
      })
      .toContain('openai: Hello from the composer');
    expect(prompt.value).toBe('');
  });

  it('scopes chat selection and messages to each feature instance', async () => {
    const first = TestBed.createComponent(AiChat);
    const second = TestBed.createComponent(AiChat);
    const firstStore = first.debugElement.injector.get(AiChatStore);
    const secondStore = second.debugElement.injector.get(AiChatStore);
    firstStore.provider.set('gemini');
    firstStore.prompt.set('Independent chat');
    await firstStore.send();
    expect(firstStore.messages()[0].provider).toBe('gemini');
    expect(secondStore.provider()).toBe('openai');
    expect(secondStore.messages()).toEqual([]);
    expect(secondStore.prompt()).toBe('');
  });
});
