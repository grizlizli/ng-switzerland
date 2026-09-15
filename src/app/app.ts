import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PwaInstall } from './features/pwa-install/pwa-install';
import { AiChat } from './features/ai-chat/ai-chat';

@Component({
  selector: 'app-root',
  imports: [AiChat, PwaInstall],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
