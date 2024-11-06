import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/src/resources/index.js';

export default class SimpleAgent {
    private readonly setupMessage: string;

    constructor(setupMessage: string) {
        this.setupMessage = setupMessage;
    }

    async createCompletion(message: string): Promise<string> {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_SECRET_KEY });

        const processedMessages: Array<ChatCompletionMessageParam> = [
            { role: 'system', content: this.setupMessage },
            { role: 'user', content: message },
        ];

        const completion = await openai.chat.completions.create({
            messages: processedMessages,
            model: 'gpt-4o',
        });

        return completion.choices[0].message.content;
    }
}
