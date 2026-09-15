import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { providePwaPromt } from './provide-pwa-promt';
import { PwaPrompt } from './pwa-prompt';

@Component({
  selector: 'app-pwa-install',
  templateUrl: './pwa-install.html',
  styleUrl: './pwa-install.css',
  providers: [providePwaPromt()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PwaInstall {
  protected readonly pwa = inject(PwaPrompt);
}
