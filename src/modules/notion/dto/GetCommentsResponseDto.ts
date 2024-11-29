import { ListCommentsResponse } from '@notionhq/client/build/src/api-endpoints';

export default class GetCommentsResponseDto {
    comments: ListCommentsResponse;

    constructor(comments: ListCommentsResponse) {
        this.comments = comments;
    }
}
