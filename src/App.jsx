import { createSignal, onMount, createEffect, For, Show } from 'solid-js';
import { createEvent, supabase } from './supabaseClient';
import { Auth } from '@supabase/auth-ui-solid';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { SolidMarkdown } from 'solid-markdown';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.js?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function App() {
  const [jokes, setJokes] = createSignal([]);
  const [newJoke, setNewJoke] = createSignal({ setup: '', punchline: '' });
  const [user, setUser] = createSignal(null);
  const [currentPage, setCurrentPage] = createSignal('login');
  const [loading, setLoading] = createSignal(false);
  const [generatedImage, setGeneratedImage] = createSignal('');
  const [audioUrl, setAudioUrl] = createSignal('');
  const [markdownText, setMarkdownText] = createSignal('');
  const [pdfSummary, setPdfSummary] = createSignal('');
  const [pdfFile, setPdfFile] = createSignal(null);

  const checkUserSignedIn = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setCurrentPage('homePage');
    }
  };

  onMount(checkUserSignedIn);

  createEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session.user);
        setCurrentPage('homePage');
      } else {
        setUser(null);
        setCurrentPage('login');
      }
    });

    return () => {
      authListener.unsubscribe();
    };
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('login');
  };

  const fetchJokes = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch('/api/getJokes', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      setJokes(data);
    } else {
      console.error('Error fetching jokes:', response.statusText);
    }
  };

  const saveJoke = async (e) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const response = await fetch('/api/saveJoke', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newJoke()),
      });
      if (response.ok) {
        setJokes([...jokes(), newJoke()]);
        setNewJoke({ setup: '', punchline: '' });
      } else {
        console.error('Error saving joke');
      }
    } catch (error) {
      console.error('Error saving joke:', error);
    }
  };

  createEffect(() => {
    if (!user()) return;
    fetchJokes();
  });

  const handleGenerateJoke = async () => {
    setLoading(true);
    try {
      const result = await createEvent('chatgpt_request', {
        prompt: 'Give me a joke in JSON format with the following structure: { "setup": "joke setup", "punchline": "joke punchline" }',
        response_type: 'json'
      });
      setNewJoke(result);
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    setLoading(true);
    try {
      const result = await createEvent('generate_image', {
        prompt: 'A funny cartoon character telling a joke'
      });
      setGeneratedImage(result);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTextToSpeech = async () => {
    setLoading(true);
    try {
      const result = await createEvent('text_to_speech', {
        text: `${newJoke().setup} ... ${newJoke().punchline}`
      });
      setAudioUrl(result);
    } catch (error) {
      console.error('Error converting text to speech:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkdownGeneration = async () => {
    setLoading(true);
    try {
      const result = await createEvent('chatgpt_request', {
        prompt: 'Write a short, funny story about a comedian in markdown format',
        response_type: 'text'
      });
      setMarkdownText(result);
    } catch (error) {
      console.error('Error generating markdown:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  const handleSummarizePdf = async () => {
    if (!pdfFile()) {
      alert('Please upload a PDF file first.');
      return;
    }
    setLoading(true);
    try {
      const pdfText = await extractTextFromPdf(pdfFile());
      const result = await createEvent('chatgpt_request', {
        prompt: `Summarize the following text in Arabic:\n\n${pdfText}`,
        response_type: 'text'
      });
      setPdfSummary(result);
    } catch (error) {
      console.error('Error summarizing PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractTextFromPdf = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => item.str);
      text += strings.join(' ') + '\n';
    }
    return text;
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4 text-gray-800">
      <Show
        when={currentPage() === 'homePage'}
        fallback={
          <div class="flex items-center justify-center min-h-screen">
            <div class="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
              <h2 class="text-3xl font-bold mb-6 text-center text-purple-600">Sign in with ZAPT</h2>
              <a
                href="https://www.zapt.ai"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 hover:underline mb-6 block text-center"
              >
                Learn more about ZAPT
              </a>
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'facebook', 'apple']}
                magicLink={true}
                view="magic_link"
                showLinks={false}
                authView="magic_link"
              />
            </div>
          </div>
        }
      >
        <div class="max-w-6xl mx-auto h-full">
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-4xl font-bold text-purple-600">New App</h1>
            <button
              class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Add New Joke Section */}
            <div class="col-span-1 md:col-span-2 lg:col-span-1">
              <h2 class="text-2xl font-bold mb-4 text-purple-600">Add New Joke</h2>
              <form onSubmit={saveJoke} class="space-y-4">
                <input
                  type="text"
                  placeholder="Setup"
                  value={newJoke().setup}
                  onInput={(e) => setNewJoke({ ...newJoke(), setup: e.target.value })}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent box-border"
                  required
                />
                <input
                  type="text"
                  placeholder="Punchline"
                  value={newJoke().punchline}
                  onInput={(e) => setNewJoke({ ...newJoke(), punchline: e.target.value })}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent box-border"
                  required
                />
                <div class="flex space-x-4">
                  <button
                    type="submit"
                    class="flex-1 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                  >
                    Save Joke
                  </button>
                  <button
                    type="button"
                    class={`flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 ${
                      loading() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    onClick={handleGenerateJoke}
                    disabled={loading()}
                  >
                    <Show when={loading()}>Generating...</Show>
                    <Show when={!loading()}>Generate Joke</Show>
                  </button>
                </div>
              </form>
            </div>

            {/* Joke List Section */}
            <div class="col-span-1 md:col-span-2 lg:col-span-1">
              <h2 class="text-2xl font-bold mb-4 text-purple-600">Joke List</h2>
              <div class="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-4">
                <For each={jokes()}>
                  {(joke) => (
                    <div class="bg-white p-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                      <p class="font-semibold text-lg text-purple-600 mb-2">{joke.setup}</p>
                      <p class="text-gray-700">{joke.punchline}</p>
                    </div>
                  )}
                </For>
              </div>
            </div>

            {/* Additional Features Section */}
            <div class="col-span-1 md:col-span-2 lg:col-span-1">
              <h2 class="text-2xl font-bold mb-4 text-purple-600">Additional Features</h2>
              <div class="space-y-4">
                <button
                  onClick={handleGenerateImage}
                  class={`w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 ${
                    loading() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  disabled={loading()}
                >
                  <Show when={loading() && !generatedImage()}>Generating...</Show>
                  <Show when={!loading() || generatedImage()}>Generate Image</Show>
                </button>
                <Show when={newJoke().setup && newJoke().punchline}>
                  <button
                    onClick={handleTextToSpeech}
                    class={`w-full px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300 ease-in-out transform hover:scale-105 ${
                      loading() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    disabled={loading()}
                  >
                    <Show when={loading() && !audioUrl()}>Converting...</Show>
                    <Show when={!loading() || audioUrl()}>Text to Speech</Show>
                  </button>
                </Show>
                <button
                  onClick={handleMarkdownGeneration}
                  class={`w-full px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition duration-300 ease-in-out transform hover:scale-105 ${
                    loading() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  disabled={loading()}
                >
                  <Show when={loading() && !markdownText()}>Generating...</Show>
                  <Show when={!loading() || markdownText()}>Generate Markdown</Show>
                </button>
                {/* PDF Summarization Feature */}
                <div class="mt-8">
                  <h2 class="text-2xl font-bold mb-4 text-purple-600">Summarize PDF</h2>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent box-border cursor-pointer"
                  />
                  <button
                    onClick={handleSummarizePdf}
                    class={`mt-4 w-full px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-300 ease-in-out transform hover:scale-105 ${
                      loading() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    disabled={loading()}
                  >
                    <Show when={loading() && !pdfSummary()}>Summarizing...</Show>
                    <Show when={!loading() || pdfSummary()}>Summarize PDF</Show>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Display Results */}
          <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Show when={generatedImage()}>
              <div>
                <h3 class="text-xl font-bold mb-2 text-purple-600">Generated Image</h3>
                <img src={generatedImage()} alt="Generated" class="w-full rounded-lg shadow-md" />
              </div>
            </Show>
            <Show when={audioUrl()}>
              <div>
                <h3 class="text-xl font-bold mb-2 text-purple-600">Audio Joke</h3>
                <audio controls src={audioUrl()} class="w-full" />
              </div>
            </Show>
            <Show when={markdownText()}>
              <div>
                <h3 class="text-xl font-bold mb-2 text-purple-600">Markdown Story</h3>
                <div class="bg-white p-4 rounded-lg shadow-md">
                  <SolidMarkdown children={markdownText()} />
                </div>
              </div>
            </Show>
            <Show when={pdfSummary()}>
              <div>
                <h3 class="text-xl font-bold mb-2 text-purple-600">PDF Summary</h3>
                <div class="bg-white p-4 rounded-lg shadow-md">
                  <p class="text-gray-700 whitespace-pre-line">{pdfSummary()}</p>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
}

export default App;