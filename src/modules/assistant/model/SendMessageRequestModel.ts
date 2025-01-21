export default class SendMessageRequestModel {
    constructor(
        public userId: string,
        public content: string,
        public conversationId: string,
    ) {}
}
