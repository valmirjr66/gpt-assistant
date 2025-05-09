require('dotenv').config();
const Pinecone = require('@pinecone-database/pinecone').Pinecone;

(async () => {
  const pineconeClient = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const indexName = process.env.INDEX_NAME;

  const { indexes } = await pineconeClient.listIndexes();

  if (indexes.some((index) => index.name === indexName)) {
    console.log(
      'Index exists and will be deleted before being recreated',
    );

    await pineconeClient.deleteIndex(indexName);

    console.log('5 seconds delay to avoid index naming conflicts');

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  await pineconeClient.createIndex({
    name: indexName,
    dimension: +process.env.VECTORS_DIMENSION,
    metric: process.env.DISTANCE_METRIC,
    spec: {
      serverless: {
        cloud: 'aws',
        region: 'us-east-1',
      },
    },
  });

  console.log(`Index "${indexName}" created`);
})();
