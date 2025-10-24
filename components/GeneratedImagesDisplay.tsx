import React, { useState } from 'react';
import DownloadIcon from './icons/DownloadIcon';

// This will tell TypeScript that JSZip is available globally from the CDN script
declare const JSZip: any;

interface GeneratedImagesDisplayProps {
  images: string[];
  shotIdeas: string[];
}

const sanitizeFilename = (text: string, maxLength: number = 50): string => {
  if (!text) return 'untitled_shot';
  // Remove special characters, trim whitespace, and replace spaces with underscores.
  const sanitized = text
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  // Truncate to maxLength to keep filenames reasonable.
  return sanitized.slice(0, maxLength);
};


const GeneratedImagesDisplay: React.FC<GeneratedImagesDisplayProps> = ({ images, shotIdeas }) => {
  const [isZipping, setIsZipping] = useState(false);

  const getFileExtension = (dataUrl: string): string => {
    const match = dataUrl.match(/^data:image\/([a-zA-Z]+);/);
    return match ? match[1] : 'png';
  };

  const handleDownloadAll = async () => {
    if (typeof JSZip === 'undefined') {
      console.error('JSZip library is not loaded.');
      alert('Could not download all images. The required library is missing.');
      return;
    }

    setIsZipping(true);

    try {
      const zip = new JSZip();

      images.forEach((image, index) => {
        const fileExtension = getFileExtension(image);
        const base64Data = image.split(',')[1];
        const idea = shotIdeas[index] || `shot`;
        // Sanitize the idea and add index for uniqueness
        const filename = `${sanitizeFilename(idea)}_${index + 1}`;

        if (base64Data) {
          zip.file(`${filename}.${fileExtension}`, base64Data, { base64: true });
        }
      });

      const content = await zip.generateAsync({ type: 'blob' });

      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product-shots.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating zip file:', error);
      alert('An error occurred while creating the zip file.');
    } finally {
      setIsZipping(false);
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-green-300 text-center sm:text-left">3. Your Generated Shots</h2>
        <button
          onClick={handleDownloadAll}
          disabled={isZipping}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-green-500/30"
        >
          <DownloadIcon className="w-5 h-5" />
          {isZipping ? 'Zipping...' : 'Download All'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {images.map((image, index) => {
            const idea = shotIdeas[index] || `shot`;
            const fileExtension = getFileExtension(image);
            const filename = `${sanitizeFilename(idea)}_${index + 1}.${fileExtension}`;

            return (
              <div key={index} className="group relative aspect-square bg-gray-700 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105">
                <img src={image} alt={`Generated shot ${index + 1}`} className="w-full h-full object-cover" />
                <a
                  href={image}
                  download={filename}
                  className="absolute top-2 right-2 bg-gray-900 bg-opacity-60 p-2 rounded-full text-white hover:bg-opacity-80 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label={`Download generated shot ${index + 1}`}
                  title="Download Image"
                >
                  <DownloadIcon className="w-5 h-5" />
                </a>
              </div>
            )
        })}
      </div>
    </div>
  );
};

export default GeneratedImagesDisplay;