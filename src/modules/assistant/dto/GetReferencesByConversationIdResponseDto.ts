import { Reference } from 'src/types/gpt';

export default class GetReferencesByConversationIdResponseDto {
    references: Reference[];

    constructor(references: Reference[]) {
        this.references = references;
    }
}
