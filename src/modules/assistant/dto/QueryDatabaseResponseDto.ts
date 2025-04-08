export default class QueryDatabaseResponseDto {
    constructor(
        public augumentedReponse: string,
        public augmentedPrompt: string,
        public source: {
            id: string;
            content: string;
            range: {
                from: number;
                to: number;
            };
            displayName: string;
            downloadURL: string;
            score: number;
        }[],
    ) {}
}
