export default class InsertEntryRequestDto {
    entries: string[];

    constructor(entries: string[]) {
        this.entries = entries;
    }
}
