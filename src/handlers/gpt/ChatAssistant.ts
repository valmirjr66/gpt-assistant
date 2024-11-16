import OpenAI from 'openai';
import { TextResponse } from './ChatAgent';
import { FileCitationAnnotation } from 'openai/resources/beta/threads/messages.mjs';

export default class ChatAssistant {
    private readonly assistantId: string;

    constructor(assistantId: string) {
        this.assistantId = assistantId;
    }

    public async startThread(): Promise<string> {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_SECRET_KEY });
        const thread = await openai.beta.threads.create();
        return thread.id;
    }

    public async addMessageToThread(
        threadId: string,
        message: string,
    ): Promise<TextResponse> {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_SECRET_KEY });

        await openai.beta.threads.messages.create(threadId, {
            role: 'user',
            content: message,
        });

        const run = await openai.beta.threads.runs.createAndPoll(threadId, {
            assistant_id: this.assistantId,
        });

        if (run.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(
                run.thread_id,
            );

            const responseContent = messages.data[0].content;

            // TODO: Remove this validation as it's only a temporary workaround
            // so I don't have to deal with all response types right now
            if (
                responseContent.length > 1 ||
                responseContent[0].type !== 'text'
            ) {
                throw new Error('Unknown response format');
            }

            return new TextResponse(
                responseContent[0].text.value,
                responseContent[0].text.annotations as FileCitationAnnotation[],
            );
        } else {
            console.log(
                "Run status was: '",
                run.status,
                "' on thread ",
                threadId,
            );

            throw new Error("Run wasn't completed");
        }
    }
}
