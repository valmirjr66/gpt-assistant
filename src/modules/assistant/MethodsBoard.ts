import axios from 'axios';
import moment from 'moment';
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
            let splittedTopics = args.topics.split(',');

            if (splittedTopics.length > 5) splittedTopics = splittedTopics;

            while (splittedTopics.length < 5) {
                const randomTopic = getRandomItemFromArray(splittedTopics);
                splittedTopics.push(randomTopic);
            }

            await Promise.all(
                splittedTopics.map(async (topic) => {
                    const completion = await dummyAgent.createCompletion(
                        `Suggest me a single post idea regarding following topic: ${topic}`,
                    );
                    postIdeas.push(completion);
                }),
            );

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
                            description:
                                'The post idea description planned to be posted on Monday',
                        },
                        tuesday: {
                            type: 'string',
                            description:
                                'The post idea description planned to be posted on Tuesday',
                        },
                        wednesday: {
                            type: 'string',
                            description:
                                'The post idea description planned to be posted on Wednesday',
                        },
                        thursday: {
                            type: 'string',
                            description:
                                'The post idea description planned to be posted on Thursday',
                        },
                        friday: {
                            type: 'string',
                            description:
                                'The post idea description planned to be posted on Friday',
                        },
                    },
                    required: [
                        'monday',
                        'tuesday',
                        'wednesday',
                        'thursday',
                        'friday',
                    ],
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
            const nextMonday = moment().day(1);

            // If the day has already passed this
            // week then move to next week
            if (moment().day() >= 5) {
                nextMonday.add(7, 'days');
            }

            let failedSome = false;

            await Promise.all(
                [
                    args.monday,
                    args.tuesday,
                    args.wednesday,
                    args.thursday,
                    args.friday,
                ].map(async (dayOfTheWeek) => {
                    try {
                        const response = await axios.post(
                            `${process.env.CLOUD_API_ADDRESS}/planning/${nextMonday.year()}/${nextMonday.month() + 1}/${nextMonday.day()}`,
                            { entries: [dayOfTheWeek] },
                        );

                        if (response.data.status !== 'ok') failedSome = true;
                    } catch (err) {
                        return {
                            data: { error: 'Error while trying to save' },
                        };
                    }
                }),
            );

            if (failedSome) return { data: 'Something went wrong' };

            return { data: 'Content saved!' };
        },
    },
];

export default methodsBoard;
