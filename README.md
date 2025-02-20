# Serverless AI-Powered Q&A App

## Overview

This project is a serverless, client-side application built using **TypeScript** and **React**. It features a lightweight question-answering bot that runs entirely in the user's browser. The AI model is loaded after the initial page render and processes all queries locally using the client’s memory.

## Features

- **Serverless Architecture**: No backend servers are required; everything runs in the browser.
- **AI-Powered Q&A**: Uses a transformer-based question-answering model from Hugging Face.
- **Client-Side Execution**: AI processing is done on the client’s machine, improving performance and privacy.
- **Interactive Terminal Interface**: Users can enter commands to interact with the bot and retrieve information.

## Tech Stack

- **React**: Frontend framework for UI development.
- **TypeScript**: Statically typed JavaScript for better maintainability.
- **@huggingface/transformers**: JavaScript library for AI-based natural language processing.

## How It Works

1. The app initializes and loads required text data from `/assets/`.
2. The Hugging Face model is loaded **after the initial paint**.
3. Users can interact with the terminal-style interface by entering commands.
4. Questions are **processed locally using the AI model without any external API calls**.
5. The AI model fetches answers based on the available context and displays responses.

## Available Commands

- `help` - Displays the list of available commands.
- `clear` - Clears the terminal history.
- `whoami` - Displays user information.
- `ls` - Lists available text files.
- `cat <file>` - Displays the contents of a specified file.
- `bot ask -m "<question>"` - Asks the AI bot a question.
- `bot pull` - Downloads the user's resume.

## Installation & Running Locally

1. Clone the repository:
   ```sh
   git clone https://github.com/kuduwa-keshavram/serverless-ai-bot.git
   cd serverless-ai-bot
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

## Deployment

Since this is a fully client-side application, it can be deployed on any static hosting service like:

- **Vercel**
- **Netlify**
- **GitHub Pages**

Simply build the project and deploy:

```sh
npm run build
```

Then, follow the static hosting service’s instructions for deployment.

## License

This project is open-source and available under the MIT License.
