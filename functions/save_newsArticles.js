// This is an async function that gets invoked when the script is run.
exports = async function (arg) {
  // Import the axios library, which is used for making HTTP requests.
  const axios = require("axios").default;

  // Perform a GET request to fetch the top stories from the 1news API.
  const reqStories = await axios.get(
    "https://www.1news.co.nz/pf/api/v3/content/fetch/top-stories-api"
  );

  // Destructure and retrieve the 'content_elements' from the fetched data.
  const { content_elements } = reqStories.data;

  // Initialize an empty array to store the cleaned stories.
  const stories = [];

  // Filter 'content_elements' to keep only elements of type 'story'.
  const storyElements = content_elements.filter((c) => c.type === "story");

  // Loop through each story element and extract relevant details.
  for (const story of storyElements) {
    // Destructure and retrieve the required fields from the story.
    const {
      type,
      canonical_url,
      headlines,
      description,
      publish_date,
      taxonomy,
      content_elements,
      distributor,
      promo_items,
    } = story;

    // Filter 'content_elements' to keep only elements of type 'text', and remove HTML tags from them.
    const storyTexts = content_elements
      .filter((c) => c.type === "text")
      .map((s) => s.content.replace("<p>", "").replace("</p>", "").trim());

    // Create a clean object representing the story with necessary details.
    const clean = {
      description: description.basic,
      url: canonical_url,
      headline: headlines.basic,
      publish_date: new Date(publish_date),
      tags: taxonomy?.tags.map((t) => t.text).join(",") || "",
      story: storyTexts,
      id: distributor.reference_id,
      updatedOn: new Date(),
      image: `https://1news.co.nz/${promo_items?.basic?.additional_properties?.fullSizeResizeUrl}`,
    };

    // Add the clean story object to the stories array.
    stories.push(clean);
  }

  // Access the MongoDB Atlas service, database, and specific collection.
  const mongodb = context.services.get("mongodb-atlas");
  const newsCollection = mongodb.db("mug_demo").collection("news_stories");

  // Define bulk operations array. Each operation is an upsert action for a story.
  let bulkOps = stories.map((story) => ({
    updateOne: {
      filter: { url: story.url }, // find a document with this "url"
      update: { $set: story }, // set the entire story object
      upsert: true, // insert the document if it does not exist
    },
  }));

  // Execute the bulk operations on the MongoDB collection.
  await newsCollection.bulkWrite(bulkOps);
};
