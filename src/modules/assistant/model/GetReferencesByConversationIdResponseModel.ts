import { Reference } from 'src/types/gpt';

export default class GetReferencesByConversationIdResponseModel {
    references: Reference[];

    constructor(references: Reference[]) {
        this.references = references;
    }
}
