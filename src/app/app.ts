import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AiChat } from './features/ai-chat/ai-chat';

@Component({
  selector: 'app-root',
  imports: [AiChat],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
