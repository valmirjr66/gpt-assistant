export default class GetByYearAndMonthResponseModel {
    items: Record<string, string[]>;

    constructor(items: Record<string, string[]>) {
        this.items = items;
    }
}
