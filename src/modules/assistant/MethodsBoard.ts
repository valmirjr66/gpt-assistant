import { ChatCompletionTool } from 'openai/resources/index.mjs';
import SimpleAgent from 'src/handlers/gpt/SimpleAgent';
import { Action } from 'src/types/gpt';

export type MethodsBoard = {
    header: ChatCompletionTool;
    callback: (...args: any[]) => Promise<{ data: Object; actions?: Action[] }>;
}[];

function getRandomItemFromArray<T>(array: T[]): T {
    const randomPosition = Math.floor(Math.random() * array.length);
    return array[randomPosition];
}

const methodsBoard: MethodsBoard = [
    {
        header: {
            type: 'function',
            function: {
                name: 'generate_next_week_post_ideas',
                description:
                    'Call this function whenever the user asks to create post ideas for the coming week. Make sure you have the list of topics to cover.',
                parameters: {
                    type: 'object',
                    properties: {
                        topics: {
                            type: 'string',
                            description:
                                'The list of topics to cover separated by comma',
                        },
                    },
                    required: ['topics'],
                    additionalProperties: false,
                },
            },
        },
        callback: async (args: { topics: string }) => {
            const dummyAgent = new SimpleAgent(
                'Você é um assistente virtual foacado na criação de ideias de post',
            );
            const postIdeas: string[] = [];
            const splittedTopics = args.topics.split(',');

            while (splittedTopics.length < 5) {
                const randomTopic = getRandomItemFromArray(splittedTopics);
                splittedTopics.push(randomTopic);
            }

            for (const topic of splittedTopics) {
                const completion = await dummyAgent.createCompletion(
                    `Suggest me a single post idea regarding following topic: ${topic}`,
                );
                postIdeas.push(completion);
                if (postIdeas.length === 5) break;
            }

            return {
                data: {
                    monday: postIdeas[0],
                    tuesday: postIdeas[1],
                    wednesday: postIdeas[2],
                    thursday: postIdeas[3],
                    friday: postIdeas[4],
                },
                actions: [
                    {
                        type: 'positive',
                        feedbackResponse: 'Cadastre essas ideias',
                        chosen: false,
                    },
                    {
                        type: 'negative',
                        feedbackResponse: 'Descarte essas ideias',
                        chosen: false,
                    },
                ],
            };
        },
    },
    {
        header: {
            type: 'function',
            function: {
                name: 'save_post_ideas',
                description:
                    'Call this function whenever the user asks to save suggested post ideas. Make sure you have each post idea in its related day of week.',
                parameters: {
                    type: 'object',
                    properties: {
                        monday: {
                            type: 'string',
                            description: 'The post idea description planned to be posted on Monday',
                        },
                        tuesday: {
                            type: 'string',
                            description: 'The post idea description planned to be posted on Tuesday',
                        },
                        wednesday: {
                            type: 'string',
                            description: 'The post idea description planned to be posted on Wednesday',
                        },
                        thursday: {
                            type: 'string',
                            description: 'The post idea description planned to be posted on Thursday',
                        },
                        friday: {
                            type: 'string',
                            description: 'The post idea description planned to be posted on Friday',
                        },
                    },
                    required: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                    additionalProperties: false,
                },
            },
        },
        callback: async (args: {
            monday: string;
            tuesday: string;
            wednesday: string;
            thursday: string;
            friday: string;
        }) => {
            console.log(args);
            return { data: 'Content saved!' };
        },
    },
];

export default methodsBoard;
