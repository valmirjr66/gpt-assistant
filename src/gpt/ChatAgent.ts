import OpenAI from 'openai';
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from 'openai/resources/index.mjs';
import ConversationDto from 'src/dto/ConversationDto';

export default class ChatAgent {
  private readonly setupMessage: string;

  constructor(setupMessage: string) {
    this.setupMessage = setupMessage;
  }

  async createCompletion(conversation: ConversationDto): Promise<string> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_SECRET_KEY });

    const messages: Array<
      | ChatCompletionSystemMessageParam
      | ChatCompletionUserMessageParam
      | ChatCompletionAssistantMessageParam
    > = [
      { role: 'system', content: this.setupMessage },
      ...conversation.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ];

    const completion = await openai.chat.completions.create({
      messages,
      model: 'gpt-4o',
    });

    return completion.choices[0].message.content;
  }
}
