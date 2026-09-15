import { TestBed } from '@angular/core/testing';
import { PwaInstall } from './pwa-install';

describe('PwaInstall', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    TestBed.configureTestingModule({ imports: [PwaInstall] });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  async function setup() {
    const fixture = TestBed.createComponent(PwaInstall);
    await fixture.whenStable();
    return fixture;
  }

  function offer(outcome: 'accepted' | 'dismissed' = 'accepted') {
    const prompt = vi.fn().mockResolvedValue(undefined);
    const event = new Event('beforeinstallprompt', { cancelable: true });
    Object.assign(event, { prompt, userChoice: Promise.resolve({ outcome }) });
    window.dispatchEvent(event);
    return { event, prompt };
  }

  it('waits for eligibility and prompts only on a user click', async () => {
    const fixture = await setup();
    expect(fixture.nativeElement.querySelector('aside')).toBeNull();
    const { event, prompt } = offer();
    await fixture.whenStable();
    expect(event.defaultPrevented).toBe(true);
    expect(prompt).not.toHaveBeenCalled();
    fixture.nativeElement.querySelector('.install').click();
    await fixture.whenStable();
    expect(prompt).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelector('aside')).toBeNull();
  });

  it('remembers dismissal for the current session', async () => {
    const fixture = await setup();
    offer('dismissed');
    await fixture.whenStable();
    fixture.nativeElement.querySelector('.install').click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('aside')).toBeNull();
    fixture.destroy();
    const next = await setup();
    offer();
    await next.whenStable();
    expect(next.nativeElement.querySelector('aside')).toBeNull();
  });

  it('hides the offer after installation from the browser menu', async () => {
    const fixture = await setup();
    offer();
    await fixture.whenStable();
    window.dispatchEvent(new Event('appinstalled'));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('aside')).toBeNull();
  });

  it('shows manual installation instructions on iOS', async () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPhone)');
    const fixture = await setup();
    expect(fixture.nativeElement.textContent).toContain('Add to Home Screen');
    expect(fixture.nativeElement.querySelector('.install')).toBeNull();
    fixture.nativeElement.querySelector('.later').click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('aside')).toBeNull();
  });

  it('handles a rejected native prompt without reusing the consumed event', async () => {
    const fixture = await setup();
    const { prompt } = offer();
    prompt.mockRejectedValue(new Error('Unavailable'));
    await fixture.whenStable();
    fixture.nativeElement.querySelector('.install').click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
      'browser menu',
    );
    expect(fixture.nativeElement.querySelector('.install')).toBeNull();
    fixture.nativeElement.querySelector('.later').click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('aside')).toBeNull();
  });

  it('does not offer installation in standalone mode', async () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);
    const fixture = await setup();
    offer();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('aside')).toBeNull();
  });
});
