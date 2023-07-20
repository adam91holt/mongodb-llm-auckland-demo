# MUG-Demo Slack Bot Application

This repository contains the code for a Slack bot application that uses MongoDB Realm serverless functions and OpenAI's API to generate funny responses to user queries based on news data.

## Overview

The application is powered by several JavaScript functions that interact with MongoDB, Slack, and OpenAI's API. It also uses MongoDB Realm triggers to automate certain tasks, such as fetching news stories and responding to user queries. The application runs on an hourly schedule, fetching the latest news stories and storing them in a MongoDB Atlas database.

## Demo

[![Presentation](http://img.youtube.com/vi/_lOeYFDuGtQ/0.jpg)](http://www.youtube.com/watch?v=_lOeYFDuGtQ)


## Components

Here is a brief overview of the key components:

- `realm_config.json`: The main configuration file for the MongoDB Realm application.

- `functions/`: This directory contains the JavaScript functions that power the application. These functions handle tasks such as sending messages to Slack, generating responses using OpenAI's API, saving news articles to the database, and responding to incoming webhooks from Slack.

- `triggers/`: This directory contains the configurations for MongoDB Realm triggers. These triggers automate tasks such as fetching news stories and responding to user queries.

- `http_endpoints/` and `graphql/`: These directories contain configurations for the HTTP endpoints and GraphQL, respectively.

- `data_sources/`: This directory contains the configuration for connecting to MongoDB Atlas.

- `auth/`: This directory contains configurations related to authentication.

- `environments/`: This directory contains environment-specific configurations.

- `values/`: This directory contains various values used by the application, such as the OpenAI API key.

## How the Application Works

The application is triggered to run on an hourly basis. Here is how it works:

1. The `fetch_newsStories.json` trigger is activated, which runs the `save_newsArticles.js` function. This function fetches the latest news stories and saves them to the MongoDB Atlas database.

2. When a user sends a query to the Slack bot, the `respond_to_question.json` trigger is activated. This trigger runs the `ask_question.js` function, which uses OpenAI's API to generate a funny response based on the user's query and the news data.

3. The response from OpenAI's API is sent back to the user on Slack using the `slack_send.js` function.

## Data

I have added a file called `mug_demo.news_stories.zip` at the root of the folder. This has all of the embeddings collected to date for you to play around with. You can load these into a collection.

## How to Use

Before running this application, you need to make sure that MongoDB App Services is properly set up and the required API keys for Slack and OpenAI are available. You will also need access to a MongoDB Atlas database where the application will store the news data. You can do all of this on the free tier.

Here are the general steps to get the application up and running:

Configure your atlas search index after you have loaded the data. 

A good guide is here [MongoDB Vector Search Tutorial](https://www.mongodb.com/developer/products/atlas/semantic-search-mongodb-atlas-vector-search/)

1. Clone this repository.
2. Go to the MongoDB Realm dashboard and import the application configuration from the `realm_config.json` file.
3. Set up the MongoDB Atlas data source according to the configuration in `data_sources/mongodb-atlas/config.json`.
4. Set up the authentication providers according to the configuration in `auth/providers.json`.
5. Set up the OpenAI API key in `values/openai_api_key.json`.
6. Deploy the application in MongoDB App Services.
7. Set up the Slack bot and configure it to use the webhook function for incoming messages.

Please note that these are general steps and might need to be adjusted based on your specific setup.

For detailed instructions on how to use MongoDB Realm, please refer to the [official MongoDB Atlas App documentation](https://www.mongodb.com/docs/atlas/app-services/). For instructions on how to set up a Slack bot, refer to the [official Slack documentation](https://api.slack.com/bot-users).
