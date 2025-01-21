import { Message } from '../schemas/MessageSchema';

export default class GetConversationResponseModel {
    constructor(
        public id: string,
        public title: string,
        public messages: Message[],
    ) {}
}
