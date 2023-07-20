// This is a change event function that runs whenever a change event occurs.
exports = async function (changeEvent) {
  // Extract the full document from the change event and get the question.
  const question = changeEvent.fullDocument.question;

  console.log(`💬 - ${question}`);

  // Execute a function named "slack_send" with a specific message.
  await context.functions.execute("slack_send", `💬 - ${question}`);

  // Get OpenAI key from Stitch's context values.
  const OPENAI_KEY = context.values.get("openai_api_key");

  // Require the necessary libraries.
  const { Configuration, OpenAIApi } = require("openai");

  // Create a new configuration object with the OpenAI key.
  const configuration = new Configuration({
    apiKey: OPENAI_KEY,
  });

  // Create a new OpenAI API object with the configuration.
  const openai = new OpenAIApi(configuration);

  // Create an embedding from the user's question.
  const embedQuestion = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: question,
  });

  // Extract the embedding data from the API response.
  const queryEmbed = embedQuestion.data.data[0].embedding;

  const chrono = require("chrono-node");
  const hasADate = chrono.parseDate(question);

  let search = {
    index: "default",
    knnBeta: {
      vector: queryEmbed,
      path: "embedding",
      k: 3, // Amount of results to return from the nearest neighbors.
    },
  };
  if (hasADate) {
    search.knnBeta.filter = {
      range: {
        gte: hasADate,
        path: "publish_date",
      },
    };
    console.log(`📅 - ${hasADate.toISOString()}`);
  }

  // Define the pipeline for querying the MongoDB collection.
  const pipeline = [
    {
      $search: search,
    },
    {
      $project: {
        url: 1,
        description: 1,
        headline: 1,
        publish_date: 1,
        tags: 1,
        story: 1,
        score: { $meta: "searchScore" },
      },
    },
  ];

  // Get the MongoDB service, database, and collection objects.
  const mongodb = context.services.get("mongodb-atlas");
  const newsCollection = mongodb.db("mug_demo").collection("news_stories");

  // Perform the search query on the MongoDB collection.
  const storyResults = await newsCollection.aggregate(pipeline).toArray();

  // Construct a string that represents the found stories.
  const storyText = storyResults.map((story, idx) => {
    return `
    \n
    HEADLINE: ${story.headline.trim()}
    TAGS: ${story.tags.trim()}
    DATE: ${story.publish_date.toLocaleString().split(",")[0]}
    STORY: ${story.story.join("").substring(0, 1000)}...
    \n
    `;
  });

  // Construct the system's initial prompt.
  const systemPrompt = `You are media observer in New Zealand that answers a users question based on the articles given to you.\n
  You MUST only use the new articles given when relevant and you MUST include the dates. \n
  You should add in some kiwi humour into every response.\n
  ${storyText}
  `;

  // Create a chat completion using the OpenAI API.
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ],
    temperature: 0.8,
  });

  // Extract the URLs from the found stories.
  const urls = storyResults.map((story) => {
    return story.url;
  });

  // Send the generated response and URLs to a slack channel.
  await context.functions.execute(
    "slack_send",
    completion.data.choices[0].message.content,
    urls
  );
};
