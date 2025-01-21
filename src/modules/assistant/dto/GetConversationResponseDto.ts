import { Message } from '../schemas/MessageSchema';

export default class GetConversationResponseDto {
    constructor(
        public id: string,
        public title: string,
        public messages: Message[],
    ) {}
}
