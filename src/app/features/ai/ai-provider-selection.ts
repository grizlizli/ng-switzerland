import { InjectionToken, type WritableSignal } from '@angular/core';
import type { AiProviderId } from './ai-provider';

export const AI_PROVIDER_SELECTION = new InjectionToken<WritableSignal<AiProviderId>>(
  'AI_PROVIDER_SELECTION',
);
