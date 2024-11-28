import { ListBlockChildrenResponse } from '@notionhq/client/build/src/api-endpoints';

export default class GetPageChildrenResponseModel {
    children: ListBlockChildrenResponse;

    constructor(children: ListBlockChildrenResponse) {
        this.children = children;
    }
}
