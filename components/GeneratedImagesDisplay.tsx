import React from 'react';
import DownloadIcon from './icons/DownloadIcon';

interface GeneratedImagesDisplayProps {
  images: string[];
}

const GeneratedImagesDisplay: React.FC<GeneratedImagesDisplayProps> = ({ images }) => {
  const getFileExtension = (dataUrl: string): string => {
    const match = dataUrl.match(/^data:image\/([a-zA-Z]+);/);
    return match ? match[1] : 'png';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {images.map((image, index) => (
        <div key={index} className="group relative aspect-square bg-gray-700 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105">
          <img src={image} alt={`Generated shot ${index + 1}`} className="w-full h-full object-cover" />
          <a
            href={image}
            download={`generated-shot-${index + 1}.${getFileExtension(image)}`}
            className="absolute top-2 right-2 bg-gray-900 bg-opacity-60 p-2 rounded-full text-white hover:bg-opacity-80 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label={`Download generated shot ${index + 1}`}
            title="Download Image"
          >
            <DownloadIcon className="w-5 h-5" />
          </a>
        </div>
      ))}
    </div>
  );
};

export default GeneratedImagesDisplay;
