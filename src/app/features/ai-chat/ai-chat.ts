import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { provideAiChat } from './provide-ai-chat';
import { AiChatStore } from './ai-chat-store';
import { ChatComposer } from './chat-composer';
import { ChatTranscript } from './chat-transcript';

@Component({
  selector: 'app-ai-chat',
  imports: [ChatComposer, ChatTranscript],
  templateUrl: './ai-chat.html',
  styleUrl: './ai-chat.css',
  providers: [provideAiChat()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiChat {
  protected readonly store = inject(AiChatStore);
}
