export default class GetPlanningResponseModel {
    items: Record<string, string[]>;

    constructor(items: Record<string, string[]>) {
        this.items = items;
    }
}
