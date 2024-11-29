import { CreateCommentResponse } from '@notionhq/client/build/src/api-endpoints';

export default class InsertCommentResponseDto {
    createdComment: CreateCommentResponse;

    constructor(createdComment: CreateCommentResponse) {
        this.createdComment = createdComment;
    }
}
