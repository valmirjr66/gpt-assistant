export default class GetByYearAndMonthResponseDto {
    items: Record<string, string[]>;

    constructor(items: Record<string, string[]>) {
        this.items = items;
    }
}
