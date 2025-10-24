import React, { useState, useCallback } from 'react';
import { analyzeProductImage, generateShotIdea } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import ImageUploader from './components/ImageUploader';
import ShotIdeasDisplay from './components/ShotIdeasDisplay';
import GeneratedImagesDisplay from './components/GeneratedImagesDisplay';
import Loader from './components/Loader';
import Header from './components/Header';

type AppState = 'initial' | 'analyzing' | 'ideas_ready' | 'generating' | 'images_ready' | 'error';
export type AspectRatio = '1:1' | '3:4' | '16:9';
export type StylePreset = 'Default' | 'Vibrant' | 'Minimalist' | 'Cinematic';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [shotIdeas, setShotIdeas] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [appState, setAppState] = useState<AppState>('initial');
  const [error, setError] = useState<string | null>(null);

  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [stylePreset, setStylePreset] = useState<StylePreset>('Default');

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    fileToBase64(file).then(base64 => setOriginalImage(base64 as string));
    resetToInitial();
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!originalImage) {
      setError('Please upload an image first.');
      setAppState('error');
      return;
    }

    setAppState('analyzing');
    setError(null);
    setShotIdeas([]);
    setGeneratedImages([]);

    try {
      const ideas = await analyzeProductImage(originalImage);
      setShotIdeas(ideas);
      setAppState('ideas_ready');
    } catch (err) {
      console.error(err);
      setError('Failed to analyze the image. Please try again.');
      setAppState('error');
    }
  }, [originalImage]);

  const handleGenerateClick = useCallback(async () => {
    if (!originalImage || shotIdeas.length === 0) {
      setError('Please analyze an image to get shot ideas first.');
      setAppState('error');
      return;
    }

    setAppState('generating');
    setError(null);
    setGeneratedImages([]);

    try {
      const imagePromises = shotIdeas.map(idea => generateShotIdea(originalImage, idea, aspectRatio, stylePreset));
      const newImages = await Promise.all(imagePromises);
      setGeneratedImages(newImages.filter((img): img is string => img !== null));
      setAppState('images_ready');
    } catch (err) {
      console.error(err);
      setError('Failed to generate images. Please try again.');
      setAppState('error');
    }
  }, [originalImage, shotIdeas, aspectRatio, stylePreset]);

  const resetToInitial = () => {
    setAppState('initial');
    setError(null);
    setShotIdeas([]);
    setGeneratedImages([]);
  };

  const isLoading = appState === 'analyzing' || appState === 'generating';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-cyan-300">1. Upload Your Product</h2>
            <ImageUploader onImageUpload={handleImageUpload} imagePreview={originalImage} />
            <button
              onClick={handleAnalyzeClick}
              disabled={!originalImage || isLoading}
              className="mt-4 w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-cyan-500/30"
            >
              {appState === 'analyzing' ? 'Analyzing...' : 'Analyze Product'}
            </button>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-gray-700 min-h-[200px]">
              <h2 className="text-xl font-bold mb-4 text-purple-300">2. Customize & Generate</h2>
              {appState === 'analyzing' && <Loader text="Generating creative ideas..." />}
              {shotIdeas.length > 0 && (
                <>
                  <ShotIdeasDisplay
                    ideas={shotIdeas}
                    disabled={isLoading}
                    aspectRatio={aspectRatio}
                    onAspectRatioChange={setAspectRatio}
                    stylePreset={stylePreset}
                    onStylePresetChange={setStylePreset}
                  />
                  <button
                    onClick={handleGenerateClick}
                    disabled={isLoading}
                    className="mt-4 w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-purple-500/30"
                  >
                    {appState === 'generating' ? 'Generating...' : `Generate ${shotIdeas.length} Shots`}
                  </button>
                </>
              )}
               {appState === 'initial' && !isLoading && <p className="text-gray-400 text-center pt-8">Shot ideas will appear here after analysis.</p>}
            </div>
            
            {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">{error}</div>}

          </div>
        </div>

        <div className="mt-12 max-w-6xl mx-auto">
          {appState === 'generating' && <Loader text="Creating your product shots... This might take a moment." />}
          <GeneratedImagesDisplay images={generatedImages} shotIdeas={shotIdeas} />
        </div>
      </main>
    </div>
  );
};

export default App;