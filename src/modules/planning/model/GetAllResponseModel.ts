export default class GetAllResponseModel {
    items: Record<string, Record<string, Record<string, string[]>>>;

    constructor(
        items: Record<string, Record<string, Record<string, string[]>>>,
    ) {
        this.items = items;
    }
}
