import OpenAI from 'openai';
import { Message } from 'src/types/gpt';

export default class ChatAgent {
  private readonly setupMessage: string;

  constructor(setupMessage: string) {
    this.setupMessage = setupMessage;
  }

  async createCompletion(messages: Message[]): Promise<string> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_SECRET_KEY });

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: this.setupMessage },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
      model: 'gpt-4o',
    });

    return completion.choices[0].message.content;
  }
}
