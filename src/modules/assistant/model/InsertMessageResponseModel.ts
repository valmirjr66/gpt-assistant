import { Role } from 'src/types/gpt';

export default class InsertMessageResponseModel {
    id: string;
    content: string;
    role: Role;
    conversationId: string;

    constructor(
        id: string,
        content: string,
        role: Role,
        conversationId: string,
    ) {
        this.id = id;
        this.content = content;
        this.role = role;
        this.conversationId = conversationId;
    }
}
