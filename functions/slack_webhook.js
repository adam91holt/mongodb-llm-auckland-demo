// This is an async function that will be triggered by a specific event.
// In this case, it's an HTTP service webhook, which will be triggered each time a new Slack message comes in.
exports = async function ({ query }, response) {
  // Access the MongoDB Atlas service, database, and specific collection.
  const mongodb = context.services.get("mongodb-atlas");
  const messagesCollection = mongodb
    .db("mug_demo")
    .collection("slack_messages");

  // Insert the new Slack message with the current date and the message content into the collection.
  // 'query.text' represents the text content of the Slack message.
  await messagesCollection.insertOne({
    date: new Date(),
    question: query.text,
  });

  // Return true to indicate that the operation was successful.
  return true;
};
