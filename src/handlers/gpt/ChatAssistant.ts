import { Logger } from '@nestjs/common';
import OpenAI from 'openai';
import {
    FileCitationAnnotation,
    TextContentBlock,
} from 'openai/resources/beta/threads/messages.mjs';
import {
    ChatCompletionMessageToolCall,
    FileObject,
} from 'openai/resources/index.mjs';
import { Action, Annotation } from 'src/types/gpt';

export class MethodResponse {
    constructor(
        toolCall: ChatCompletionMessageToolCall,
        response: string,
        actions: Action[] = [],
    ) {
        this.toolCall = toolCall;
        this.response = response;
        this.actions = actions;
    }

    toolCall: ChatCompletionMessageToolCall;
    response: string;
    actions: Action[];
}

export class TextResponse {
    constructor(content: string, annotations?: Annotation[]) {
        this.content = content;
        this.annotations = annotations;
    }

    content: string;
    annotations?: Annotation[];
}

export default class ChatAssistant {
    private logger: Logger = new Logger('ChatAssistant');
    private readonly assistantId: string;
    private readonly openaiClient: OpenAI = new OpenAI({
        apiKey: process.env.OPENAI_SECRET_KEY,
    });

    constructor(assistantId: string) {
        this.assistantId = assistantId;
    }

    public async startThread(): Promise<string> {
        const thread = await this.openaiClient.beta.threads.create();
        return thread.id;
    }

    public async addMessageToThread(
        threadId: string,
        message: string,
    ): Promise<TextResponse> {
        await this.openaiClient.beta.threads.messages.create(threadId, {
            role: 'user',
            content: message,
        });

        const run = await this.openaiClient.beta.threads.runs.createAndPoll(
            threadId,
            {
                assistant_id: this.assistantId,
            },
        );

        if (run.status === 'completed') {
            const messages = await this.openaiClient.beta.threads.messages.list(
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
            this.logger.log(
                `Run status was: '${run.status}' on thread ${threadId}.
                Error is as following: ${run.last_error}`,
            );

            throw new Error("Run wasn't completed");
        }
    }

    public async addMessageToThreadByStream(
        threadId: string,
        message: string,
        streamingCallback: (
            textSnapshot: string,
            annotationsSnapshot: Annotation[],
            finished: boolean,
        ) => Promise<void>,
    ): Promise<TextResponse> {
        await this.openaiClient.beta.threads.messages.create(threadId, {
            role: 'user',
            content: message,
        });

        let response: TextResponse;

        const run = this.openaiClient.beta.threads.runs
            .stream(threadId, {
                assistant_id: this.assistantId,
            })
            .on('textCreated', () =>
                this.logger.log(
                    `textCreated for thread '${threadId}' with following incoming message '${message}'`,
                ),
            )
            .on(
                'textDelta',
                async (_textDelta, snapshot) =>
                    await streamingCallback(
                        snapshot.value,
                        snapshot.annotations as FileCitationAnnotation[],
                        false,
                    ),
            )
            .on('messageDone', async (message) => {
                const textContent = message.content[0] as TextContentBlock;

                await streamingCallback(
                    textContent.text.value,
                    textContent.text.annotations as FileCitationAnnotation[],
                    true,
                );

                response = new TextResponse(
                    textContent.text.value,
                    textContent.text.annotations as FileCitationAnnotation[],
                );
            });

        await run.done();

        return response;
    }

    public async getFileById(id: string): Promise<FileObject | null> {
        try {
            return await this.openaiClient.files.retrieve(id);
        } catch (err) {
            return null;
        }
    }
}
