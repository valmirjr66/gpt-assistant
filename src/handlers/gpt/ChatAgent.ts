import OpenAI from 'openai';
import { ChatCompletionMessageToolCall } from 'openai/resources/index.mjs';
import { ChatCompletionMessageParam } from 'openai/src/resources/index.js';
import { MethodsBoard } from 'src/modules/assistant/MethodsBoard';
import { Message } from 'src/types/gpt';

export class MethodResponse {
    constructor(toolCall: ChatCompletionMessageToolCall, response: string) {
        this.toolCall = toolCall;
        this.response = response;
    }

    toolCall: ChatCompletionMessageToolCall;
    response: string;
}

export class TextResponse {
    constructor(content: string) {
        this.content = content;
    }

    content: string;
}

export default class ChatAgent {
    private readonly setupMessage: string;
    private readonly methodsBoard: MethodsBoard;

    constructor(setupMessage: string, methodsBoard: MethodsBoard) {
        this.setupMessage = setupMessage;
        this.methodsBoard = methodsBoard;
    }

    private async createCompletion(
        conversationSoFar: Message[],
        allowTools: boolean,
    ): Promise<MethodResponse | TextResponse> {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_SECRET_KEY });

        const processedMessages: Array<ChatCompletionMessageParam> = [
            { role: 'system', content: this.setupMessage },
        ];

        for (const message of conversationSoFar) {
            if (message.role === 'tool')
                processedMessages.push({
                    role: message.role,
                    tool_call_id: message.toolCall.id,
                    content: message.content,
                });
            else if (message.role === 'assistant' && message.toolCall) {
                processedMessages.push({
                    role: message.role,
                    tool_calls: [
                        {
                            id: message.toolCall.id,
                            type: 'function',
                            function: {
                                name: message.toolCall.functionName,
                                arguments: message.toolCall.functionArguments,
                            },
                        },
                    ],
                });
            } else
                processedMessages.push({
                    role: message.role,
                    content: message.content,
                });
        }

        const completion = await openai.chat.completions.create({
            messages: processedMessages,
            model: 'gpt-4o',
            tools: allowTools
                ? this.methodsBoard.map((method) => method.header)
                : null,
        });

        if (
            allowTools &&
            completion.choices[0].finish_reason === 'tool_calls'
        ) {
            const functionName =
                completion.choices[0].message.tool_calls[0].function.name;
            const configuredMethod = this.methodsBoard.find(
                (method) => method.header.function.name === functionName,
            );
            const params = JSON.parse(
                completion.choices[0].message.tool_calls[0].function.arguments,
            );

            if (configuredMethod) {
                const response = JSON.stringify(
                    await configuredMethod.callback(params),
                );
                return new MethodResponse(
                    completion.choices[0].message.tool_calls[0],
                    response,
                );
            }

            throw new Error('Non configured method');
        }

        return new TextResponse(completion.choices[0].message.content);
    }

    async createCompletionWithTools(
        conversationSoFar: Message[],
    ): Promise<TextResponse | MethodResponse> {
        return await this.createCompletion(conversationSoFar, true);
    }

    async createCompletionWithoutTools(
        conversationSoFar: Message[],
    ): Promise<TextResponse> {
        return (await this.createCompletion(
            conversationSoFar,
            false,
        )) as TextResponse;
    }
}
