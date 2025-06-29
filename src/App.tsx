import { useState, useRef, useCallback, useEffect } from 'react';
import { pipeline, env } from '@xenova/transformers';

// Force fetching from Hugging Face hub
env.allowLocalModels = false;

// --- Helper Components ---

const Icon = ({ path }: { path: string }) => (
  <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
    <path d={path} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Loader = ({ status }: { status: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-gray-400">
    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-600 h-12 w-12 mb-4 animate-spin"></div>
    <p className="text-sm text-center">{status}</p>
  </div>
);

type ResultItemProps = {
  label: string;
  score: number;
};

const ResultItem = ({ label, score }: ResultItemProps) => {
  const percentage = (score * 100).toFixed(1);
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1 text-sm font-medium text-gray-300">
        <span>{label.split(', ')[0]}</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-gray-600 rounded-full h-2.5">
        <div
          className="bg-blue-500 h-2.5 rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundImage:
              'linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent)',
            backgroundSize: '1rem 1rem',
          }}
        ></div>
      </div>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [results, setResults] = useState<ResultItemProps[]>([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const classifier = useRef<Awaited<ReturnType<typeof pipeline>> | null>(null);

  const initializeModel = useCallback(async () => {
    if (!classifier.current) {
      setStatus('Initializing model (this may take a moment)...');
      classifier.current = await pipeline(
        'image-classification',
        'Xenova/vit-base-patch16-224',
        { quantized: false }
      );
      setStatus('');
    }
  }, []);

  // Initialize model when app loads
  useEffect(() => {
    initializeModel();
  }, [initializeModel]);

  const handleAnalyze = async (imageSource: string) => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setImagePreview(imageSource);

    try {
      if (!classifier.current) {
        await initializeModel();
      }
      setStatus('Analyzing image...');
      const analysisResults = await classifier.current!(imageSource, {});
      // Ensure results are in the correct format
      type AnalysisResult = { label: string; score: number };
      const imageResults = analysisResults as AnalysisResult[];
      if (Array.isArray(imageResults) && imageResults.length > 0 && 'label' in imageResults[0] && 'score' in imageResults[0]) {
        setResults(
          imageResults.map((item) => ({
            label: item.label,
            score: item.score,
          }))
        );
      } else {
        setResults([]);
      }
      setStatus('');
    } catch (err: unknown) {
      console.error("Analysis failed:", err);
      if (
        imageSource.startsWith('http') &&
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as { message?: unknown }).message === 'string' &&
        (err as { message: string }).message.includes('fetch')
      ) {
        setError({
          title: 'Could Not Load Image URL',
          message:
            "For security reasons, direct links from many sites are blocked. Please download the image and use 'Upload from Device'."
        });
      } else {
        setError({
          title: 'Analysis Failed',
          message: 'An unexpected error occurred. Try a different image.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (res) => handleAnalyze(res.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl) {
      handleAnalyze(imageUrl);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-gray-800');
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (res) => handleAnalyze(res.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500', 'bg-gray-800');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-gray-800');
  };

  const resetState = () => {
    setImagePreview(null);
    setResults([]);
    setError(null);
    setIsLoading(false);
    setImageUrl('');
    setStatus('');
  };

  const showInputSection = !imagePreview;
  const showOutputSection = !!imagePreview;

  return (
    <div className="bg-gray-900 text-gray-200 flex items-center justify-center min-h-screen p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">AI Image Analyzer</h1>
          <p className="text-lg text-gray-400">Powered by React & Transformers.js</p>
        </header>

        <main className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-700">
          {showInputSection && (
            <div>
              <div className="flex border-b border-gray-600 mb-6">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-3 text-center font-semibold border-b-2 transition-colors ${activeTab === 'upload' ? 'border-blue-500 text-white' : 'border-transparent text-gray-400'}`}
                >
                  Upload from Device
                </button>
                <button
                  onClick={() => setActiveTab('url')}
                  className={`flex-1 py-3 text-center font-semibold border-b-2 transition-colors ${activeTab === 'url' ? 'border-blue-500 text-white' : 'border-transparent text-gray-400'}`}
                >
                  Paste Image URL
                </button>
              </div>

              {activeTab === 'upload' ? (
                <div 
                  className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer transition-all duration-300 hover:bg-gray-700/50 hover:border-blue-500"
                  onClick={() => {
                    const input = document.getElementById('file-upload');
                    if (input) input.click();
                  }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Icon path="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" />
                  <p className="mt-4 text-gray-400">
                    <span className="font-semibold text-blue-400">Drag & drop an image</span> or click to select a file.
                  </p>
                  <label htmlFor="file-upload" className="sr-only">Upload image file</label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    title="Upload image file"
                  />
                </div>
              ) : (
                <form onSubmit={handleUrlSubmit} className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter a direct image URL..." 
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition-colors duration-300">
                    Analyze
                  </button>
                </form>
              )}
            </div>
          )}

          {showOutputSection && (
            <div>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/2">
                  <h3 className="text-xl font-semibold text-white mb-4">Your Image</h3>
                  <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden shadow-lg">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-xl font-semibold text-white mb-4">AI Analysis</h3>
                  {isLoading && <Loader status={status} />}
                  {error && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                       <h4 className="font-semibold text-red-400 mb-2">{error.title}</h4>
                       <p className="text-sm text-gray-400">{error.message}</p>
                    </div>
                  )}
                  {results.length > 0 && (
                    <div className="space-y-3">
                      {results.map((result) => (
                        <ResultItem key={result.label} {...result} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center mt-8">
                <button onClick={resetState} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-md transition-colors duration-300">
                  Analyze Another Image
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
