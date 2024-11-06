import { Action, Role } from 'src/types/gpt';

export default class SendMessageResponseModel {
    id: string;
    content: string;
    role: Role;
    conversationId: string;
    actions: Action[]

    constructor(
        id: string,
        content: string,
        role: Role,
        conversationId: string,
        actions: Action[] = []
    ) {
        this.id = id;
        this.content = content;
        this.role = role;
        this.conversationId = conversationId;
        this.actions = actions
    }
}
