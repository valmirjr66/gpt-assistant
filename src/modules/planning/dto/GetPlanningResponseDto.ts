export default class GetPlanningResponseDto {
    items: Record<string, string[]>;

    constructor(items: Record<string, string[]>) {
        this.items = items;
    }
}
