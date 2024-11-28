import { Client } from '@notionhq/client';
import { ListBlockChildrenResponse } from '@notionhq/client/build/src/api-endpoints';

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
}
