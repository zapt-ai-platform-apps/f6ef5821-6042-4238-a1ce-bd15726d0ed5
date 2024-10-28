# New App

**Overview**

New App is a user-friendly application that allows users to:

1. **Sign in with ZAPT**: Securely sign in using ZAPT authentication, supporting providers like Google, Facebook, or Apple.

2. **Manage Jokes**:
   - **Add New Jokes**: Create and save your own jokes.
   - **Generate Jokes with AI**: Use artificial intelligence to generate jokes automatically.
   - **View Saved Jokes**: Browse through your collection of jokes.

3. **Additional Features**:
   - **Generate Images**: Create images based on AI prompts.
   - **Text to Speech**: Convert your jokes into speech.
   - **Generate Markdown Stories**: Generate funny stories in markdown format.

4. **Summarize PDF Files with AI**:
   - **Upload PDF Files**: Upload PDF files directly through the app.
   - **AI-Powered Summarization**: Use AI to generate concise summaries of your PDF documents.
   - **View Summaries**: Display the summarized content within the app.

**User Guide**

1. **Signing In**:
   - Open the app.
   - Click on "Sign in with ZAPT".
   - Choose your preferred authentication provider (Google, Facebook, Apple).
   - After successful authentication, you will be redirected to the home page.

2. **Adding and Generating Jokes**:
   - **Add New Joke**:
     - Navigate to the "Add New Joke" section.
     - Enter the joke's setup and punchline.
     - Click "Save Joke" to store it.
   - **Generate Joke with AI**:
     - Click on "Generate Joke".
     - The app will use AI to generate a new joke and display it in the input fields.
     - You can edit and save it if desired.

3. **Viewing Jokes**:
   - Navigate to the "Joke List" section.
   - Browse through your saved jokes displayed in a list format.

4. **Using Additional Features**:
   - **Generate Image**:
     - Click on "Generate Image".
     - An AI-generated image based on a prompt will be displayed.
   - **Text to Speech**:
     - Ensure you have a joke entered in the input fields.
     - Click on "Text to Speech".
     - The app will generate an audio version of your joke.
   - **Generate Markdown Story**:
     - Click on "Generate Markdown".
     - An AI-generated funny story in markdown format will be displayed.

5. **Summarizing PDF Files**:
   - Navigate to the "Summarize PDF" section.
   - Click on "Upload PDF" and select a PDF file from your device.
   - Click "Summarize PDF".
   - The app will process the PDF and display a concise AI-generated summary.

6. **Signing Out**:
   - Click on the "Sign Out" button at the top-right corner to securely log out.

**External APIs Used**

- **ZAPT Authentication**: Used for user authentication and session management.
- **AI Services via `createEvent`**:
  - **chatgpt_request**: For generating jokes, summaries, and markdown stories.
  - **generate_image**: For creating images based on prompts.
  - **text_to_speech**: For converting text into speech audio files.

**Note**: All AI-powered features utilize the `createEvent` function to communicate with backend services.
