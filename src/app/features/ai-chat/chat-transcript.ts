import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ChatMessage } from './chat-message';

@Component({
  selector: 'app-chat-transcript',
  templateUrl: './chat-transcript.html',
  styleUrl: './chat-transcript.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatTranscript {
  readonly messages = input.required<readonly ChatMessage[]>();
  readonly pending = input(false);
}
