// This is an async function that sends a message to a Slack channel.
exports = async function (message, urls) {
  // Import the axios library, which is used for making HTTP requests.
  const axios = require("axios").default;

  // Slack webhook URL to which the message will be posted.
  const MY_SLACK_WEBHOOK_URL = "YOUR_WEBHOOK_URL";

  // Access the MongoDB Atlas service, database, and specific collection.
  const mongodb = context.services.get("mongodb-atlas");
  const newsCollection = mongodb.db("mug_demo").collection("news_stories");

  // Check if URLs have been passed to the function.
  const urlPassed = urls && urls.length > 0;

  // If URLs have been passed, find the corresponding stories in the database.
  const stories = urlPassed
    ? await newsCollection.find({ url: { $in: urls } }).toArray()
    : [];

  // Define the initial message block to be sent to Slack.
  let blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: message,
      },
    },
  ];

  // If URLs have been passed, add a "Sources:" section to the message.
  if (urlPassed) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "plain_text",
          text: "Sources:",
          emoji: true,
        },
      ],
    });
  }

  // For each story associated with the URLs, create a message section with the headline, description, and a button to view the story.
  stories.forEach((story) => {
    const thisStory = [
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${story.headline}*\n${story.description}`,
        },
        accessory: {
          type: "image",
          image_url:
            story.image ||
            "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg",
          alt_text: "image",
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "🤖 🚀 😎",
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "View",
            emoji: true,
          },
          value: "button",
          url: `https://www.1news.co.nz${story.url}`,
          action_id: "button-action",
        },
      },
      {
        type: "divider",
      },
    ];
    // Add the created section to the message blocks.
    blocks = [...blocks, ...thisStory];
  });

  // Prepare the final payload to be sent to Slack.
  const payload = {
    username: "bot",
    blocks: blocks,
  };

  // Send the message to Slack using the webhook URL.
  await axios.post(MY_SLACK_WEBHOOK_URL, payload);
};
