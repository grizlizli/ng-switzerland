import type { Provider } from '@angular/core';
import { PWAPrompt  } from './pwa-prompt';

export function providePwaPrompt(): Provider[] {
  return [PWAPrompt];
}
