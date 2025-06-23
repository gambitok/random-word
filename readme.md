# English Vocabulary Chrome Extension

A Chrome extension built with React and OpenRouter API to help users learn a new English word every day. The extension shows a daily word with translation, part of speech, example sentences, and allows users to save or remove words from their history. Users can filter words by tags to get vocabulary tailored to their interests.

A simple Telegram bot that reads a prompt from a file, sends it to the OpenRouter API (e.g., Mixtral 8x7b), and posts the AI-generated response to a Telegram channel.

## Features

- Daily English word with Ukrainian translation and examples

- Save and remove words from history

- History shows last 5 saved words with option to expand

- Automatic daily word update at midnight

- Tag-based filtering for personalized word selection

- Settings panel for selecting tags

- Uses OpenRouter API for word generation and translation

- Persistent data storage using Chrome local storage

## Getting Started

1. **Clone the repository** (or download the files):

```bash
git clone https://github.com/gambitok/random-word.git
cd random-word
```
2. **Install dependencies**:

```bash
npm install
```

3. **Create a .env file in the root folder**:

```bash
VITE_OPENROUTER_API_KEY=your_api_key_here
VITE_OPENROUTER_MODEL=openrouter/your_model_name
```

4. **Running in development mode**:

```bash
npm run dev
```

- Open Chrome and load the extension:

- Go to chrome://extensions/

- Enable "Developer mode"

- Click "Load unpacked" and select the dist folder

5. **Building for production**:

```bash
npm run build
```

## Usage

- Click the extension icon to open the popup.

- View the daily word, its translation, part of speech, and example sentences.

- Use “Other word” button to get a new word instantly.

- Use “Save” / “Remove” buttons to manage word history.

- Open settings panel to select tags for word filtering.

- History stores up to 100 saved words and shows the last 5 by default.

- History can be cleared via the “Clear history” button.