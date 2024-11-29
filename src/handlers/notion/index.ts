import { Client } from '@notionhq/client';
import {
    CreateCommentResponse,
    ListBlockChildrenResponse,
    ListCommentsResponse,
} from '@notionhq/client/build/src/api-endpoints';

export default class NotionHandler {
    private readonly client: Client;

    constructor() {
        this.client = new Client({
            auth: process.env.NOTION_TOKEN,
        });
    }

    public async getPageChildren(
        id: string,
    ): Promise<ListBlockChildrenResponse | null> {
        try {
            const pageChildren = await this.client.blocks.children.list({
                block_id: id,
            });

            return pageChildren;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    public async createComment(
        pageId: string,
        comment: string,
    ): Promise<CreateCommentResponse> {
        try {
            const result = await this.client.comments.create({
                parent: { page_id: pageId },
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: comment,
                        },
                        annotations: {
                            color: 'yellow_background',
                        },
                    },
                ],
            });

            return result;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    public async listComments(pageId: string): Promise<ListCommentsResponse> {
        try {
            const comments = await this.client.comments.list({
                block_id: pageId,
            });

            return comments;
        } catch (err) {
            console.error(err);
        }
    }
}
