import { Action, Annotation, Role } from 'src/types/gpt';

export default class SendMessageResponseDto {
    id: string;
    content: string;
    role: Role;
    conversationId: string;
    conversationTitle: string;
    actions: Action[];
    annotations: Annotation[];

    constructor(
        id: string,
        content: string,
        role: Role,
        conversationId: string,
        conversationTitle: string,
        actions: Action[] = [],
        annotations: Annotation[] = [],
    ) {
        this.id = id;
        this.content = content;
        this.role = role;
        this.conversationId = conversationId;
        this.conversationTitle = conversationTitle;
        this.actions = actions;
        this.annotations = annotations;
    }
}
