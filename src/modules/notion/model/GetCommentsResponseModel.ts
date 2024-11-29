import { ListCommentsResponse } from '@notionhq/client/build/src/api-endpoints';

export default class GetCommentsResponseModel {
    comments: ListCommentsResponse;

    constructor(comments: ListCommentsResponse) {
        this.comments = comments;
    }
}
