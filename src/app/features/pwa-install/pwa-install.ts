import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'ng-ai-install-dismissed';

@Component({
  selector: 'app-pwa-install',
  templateUrl: './pwa-install.html',
  styleUrl: './pwa-install.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PwaInstall {
  readonly #destroyRef = inject(DestroyRef);
  readonly #prompt = signal<InstallPromptEvent | null>(null);
  readonly #installed = signal(false);
  readonly #dismissed = signal(false);
  protected readonly ios = signal(false);
  protected readonly pending = signal(false);
  protected readonly error = signal('');
  protected readonly visible = computed(
    () => !this.#installed() && !this.#dismissed() && (!!this.#prompt() || this.ios()),
  );
  protected readonly canInstall = computed(() => !!this.#prompt());

  constructor() {
    afterNextRender(() => {
      const displayMode = window.matchMedia('(display-mode: standalone)');
      const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
      this.#installed.set(displayMode.matches || navigatorWithStandalone.standalone === true);
      this.ios.set(
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
          (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
      );
      try {
        this.#dismissed.set(sessionStorage.getItem(DISMISSED_KEY) === 'true');
      } catch {
        /* Installation remains available when storage is blocked. */
      }

      const beforeInstall = (event: Event) => {
        event.preventDefault();
        this.#prompt.set(event as InstallPromptEvent);
        this.error.set('');
      };
      const installed = () => {
        this.#installed.set(true);
        this.#prompt.set(null);
      };
      const displayChanged = (event: MediaQueryListEvent) => {
        if (event.matches) installed();
      };
      window.addEventListener('beforeinstallprompt', beforeInstall);
      window.addEventListener('appinstalled', installed);
      displayMode.addEventListener('change', displayChanged);
      this.#destroyRef.onDestroy(() => {
        window.removeEventListener('beforeinstallprompt', beforeInstall);
        window.removeEventListener('appinstalled', installed);
        displayMode.removeEventListener('change', displayChanged);
      });
    });
  }

  protected dismiss(): void {
    this.#dismissed.set(true);
    try {
      sessionStorage.setItem(DISMISSED_KEY, 'true');
    } catch {
      /* Dismissal still applies for this page lifetime. */
    }
  }

  protected async install(): Promise<void> {
    const prompt = this.#prompt();
    if (!prompt || this.pending()) return;
    this.pending.set(true);
    this.error.set('');
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') this.#installed.set(true);
      else this.dismiss();
    } catch {
      this.error.set('Installation could not start. Use your browser menu to install the app.');
    } finally {
      // A browser install event can only be prompted once.
      if (this.#prompt() === prompt) this.#prompt.set(null);
      this.pending.set(false);
    }
  }
}
