export type VectorQueryResponse = {
    id: string;
    content: string;
    range: { from: number; to: number };
    score: number;
};
