import { Logger } from '@nestjs/common';
import {
    Pinecone,
    PineconeRecord,
    RecordMetadata,
} from '@pinecone-database/pinecone';
import { VectorQueryResponse } from 'src/types/vector/index.js';

export default class VectorDatabaseHandler {
    private readonly TEXT_SPLITTER_CHUNK_SIZE = 1000;
    private readonly TEXT_SPLITTER_CHUNK_OVERLAP = 100;
    private readonly UPSERT_BATCH_SIZE = 100;
    private readonly QUERY_TOP_K_AMOUNT = 5;

    private readonly logger: Logger = new Logger('VectorDatabaseHandler');
    private readonly pineconeClient: Pinecone;

    constructor(private readonly indexName: string) {
        this.pineconeClient = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
    }

    async processFile(id: string, name: string, buffer: Buffer): Promise<void> {
        this.logger.log(`Processing file: "${name}"`);

        const index = this.pineconeClient.Index(this.indexName);

        const { OpenAIEmbeddings } = await import(
            'langchain/embeddings/openai'
        );
        const { RecursiveCharacterTextSplitter } = await import(
            'langchain/text_splitter'
        );

        const fileContent = await this.loadFile(name, buffer);

        this.logger.log(`File "${name}" loaded`);

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: this.TEXT_SPLITTER_CHUNK_SIZE,
            chunkOverlap: this.TEXT_SPLITTER_CHUNK_OVERLAP,
        });

        const chunks = await textSplitter.createDocuments([fileContent]);

        this.logger.log(`Text split into ${chunks.length} chunks`);

        const embeddingsArrays = await new OpenAIEmbeddings().embedDocuments(
            chunks.map((chunk) => chunk.pageContent.replace(/\n/g, ' ')),
        );

        this.logger.log('Document embedded');

        let batch: PineconeRecord<RecordMetadata>[] = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];

            const vector = {
                id,
                values: embeddingsArrays[i],
                metadata: {
                    fromLine: chunk.metadata.loc.lines.from,
                    toLine: chunk.metadata.loc.lines.to,
                    content: chunk.pageContent,
                },
            };

            batch.push(vector);

            if (
                batch.length === this.UPSERT_BATCH_SIZE ||
                i === chunks.length - 1
            ) {
                await index.upsert(batch);
                batch = [];
            }
        }

        this.logger.log(`Index updated with the embedding of "${name}"`);
    }

    private async loadFile(
        fileName: string,
        fileBuffer: Buffer,
    ): Promise<string> {
        const blob = new Blob([fileBuffer]);

        const { BaseDocumentLoader } = await import(
            'langchain/document_loaders/base'
        );

        let loader: InstanceType<typeof BaseDocumentLoader>;

        if (fileName.endsWith('txt')) {
            const { TextLoader } = await import(
                'langchain/document_loaders/fs/text'
            );
            loader = new TextLoader(blob);
        } else if (fileName.endsWith('pdf')) {
            const { PDFLoader } = await import(
                'langchain/document_loaders/fs/pdf'
            );
            loader = new PDFLoader(blob, { splitPages: false });
        } else {
            throw new Error(`Unsupported file type: "${fileName}"`);
        }

        return (await loader.load())[0].pageContent;
    }

    async queryDatabase(query: string): Promise<VectorQueryResponse[]> {
        this.logger.log(`Querying vector database: "${query}"`);

        const index = this.pineconeClient.Index(this.indexName);

        const { OpenAIEmbeddings } = await import(
            'langchain/embeddings/openai'
        );

        const queryEmbedding = await new OpenAIEmbeddings().embedQuery(query);

        this.logger.log(`Query embedded`);

        const queryResponse = await index.query({
            topK: this.QUERY_TOP_K_AMOUNT,
            vector: queryEmbedding,
            includeMetadata: true,
        });

        const queryMatches = queryResponse.matches;

        this.logger.log(`Found ${queryMatches.length} matches`);

        if (queryMatches.length) {
            return queryMatches.map((match) => {
                const { metadata, id } = match;

                return {
                    id,
                    content: metadata.content.toString(),
                    range: {
                        from: +metadata.fromLine.valueOf(),
                        to: +metadata.toLine.valueOf(),
                    },
                };
            });
        } else {
            return [];
        }
    }
}
