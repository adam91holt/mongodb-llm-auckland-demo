// The async function is the main entry point for this script.
exports = async function (changeEvent) {
  // Retrieve the OpenAI key from the Stitch application's context.
  const OPENAI_KEY = context.values.get("openai_api_key");

  // Import the necessary libraries from the OpenAI package.
  const { Configuration, OpenAIApi } = require("openai");

  // Create a new Configuration object using the OpenAI key.
  const configuration = new Configuration({
    apiKey: OPENAI_KEY,
  });

  // Initialize a new OpenAI API instance with the provided configuration.
  const openai = new OpenAIApi(configuration);

  // Extract the full document from the change event.
  const story = changeEvent.fullDocument;

  // Prepare a string with various story details.
  const toEmbed = `
  Tags: ${story.tags}\n
  ${story.headline}\n
  ${story.description}\n 
  ${story.story.join("\n")}
  `;

  // Generate an embedding for the story using OpenAI's createEmbedding method.
  const embedding = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: toEmbed,
  });

  // Extract the actual embedding data from the OpenAI API response.
  const embeddingValue = embedding.data.data[0].embedding;

  // Access the MongoDB Atlas service, database, and specific collection.
  const mongodb = context.services.get("mongodb-atlas");
  const newsCollection = mongodb.db("mug_demo").collection("news_stories");

  // Update the document in the MongoDB collection to include the generated embedding.
  await newsCollection.updateOne(
    { url: story.url },
    { $set: { embedding: embeddingValue } }
  );
};
