import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { providePwaPrompt } from './provide-pwa-promt';
import { PWAPrompt } from './pwa-prompt';

@Component({
  selector: 'app-pwa-install',
  templateUrl: './pwa-install.html',
  styleUrl: './pwa-install.css',
  providers: [providePwaPrompt()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PwaInstall {
  protected readonly pwa = inject(PWAPrompt);
}
