import type { Provider } from '@angular/core';
import { PwaPrompt } from './pwa-prompt';

export function providePwaPromt(): Provider[] {
  return [PwaPrompt];
}
