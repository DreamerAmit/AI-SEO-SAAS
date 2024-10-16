import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ScrapedImages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedImages, setSelectedImages] = useState([]);
  const [scrapedImages, setScrapedImages] = useState([]);
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (location.state?.scrapedImages) {
      setScrapedImages(location.state.scrapedImages);
    }
    if (location.state?.url) {
      setUrl(location.state.url);
    }
  }, [location.state]);

  const handleImageSelect = (image) => {
    setSelectedImages(prev => 
      prev.includes(image) ? prev.filter(img => img !== image) : [...prev, image]
    );
  };

  const handleSelectAll = () => {
    setSelectedImages(scrapedImages);
  };

  const handleSelectNone = () => {
    setSelectedImages([]);
  };

  const handleSelectMissingAltText = () => {
    setSelectedImages(scrapedImages.filter(img => !img.alt));
  };

  const handleGenerateAltText = async () => {
    console.log('Generating alt text for:', selectedImages);
  };

  const handleNewPageScrape = () => {
    navigate('/scrape');
  };

  if (!Array.isArray(scrapedImages) || scrapedImages.length === 0) {
    return <div>No images found. Please try scraping again.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Select Images to Process</h1>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded"
          onClick={handleNewPageScrape}
        >
          New Page Scrape
        </button>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Summary:</h2>
        <a href={url} className="text-blue-600 hover:underline">{url}</a>
        <p>Total Scraped Images: {scrapedImages.length} | Images Missing Alt Text: {scrapedImages.filter(img => !img.alt).length}</p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <button className="text-indigo-600 underline">Jump to bottom</button>
        <div>
          <span className="mr-2">Select:</span>
          <button className="text-indigo-600 underline mr-2" onClick={handleSelectAll}>All</button>
          <button className="text-indigo-600 underline mr-2" onClick={handleSelectNone}>None</button>
          <button className="text-indigo-600 underline" onClick={handleSelectMissingAltText}>Missing alt text</button>
        </div>
      </div>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">#</th>
            <th className="border p-2">IMAGE</th>
            <th className="border p-2">EXISTING ALT TEXT</th>
          </tr>
        </thead>
        <tbody>
          {scrapedImages.map((image, index) => (
            <tr key={index}>
              <td className="border p-2">
                <input
                  type="checkbox"
                  checked={selectedImages.includes(image)}
                  onChange={() => handleImageSelect(image)}
                />
                {index + 1}
              </td>
              <td className="border p-2">
                {image.src ? (
                  <a href={image.src} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    {image.src.split('/').pop() || 'Unnamed Image'}
                  </a>
                ) : (
                  'Invalid image source'
                )}
              </td>
              <td className="border p-2">{image.alt || 'No alt text'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Alt Text generation options</h2>
        <div className="mb-4">
          <label className="block mb-2">Alt Text Language</label>
          <select className="border p-2 w-full max-w-xs">
            <option>English</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            Ecommerce Data
          </label>
          <p className="text-sm text-gray-600">Add specific product data to be used in the alt text.</p>
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            SEO Keywords
          </label>
          <p className="text-sm text-gray-600">Include SEO keywords in the generated alt text for the selected images.</p>
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            ChatGPT Modification
          </label>
          <p className="text-sm text-gray-600">Use your own ChatGPT prompt on the alt text.</p>
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            Overwrite existing
          </label>
        </div>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded"
          onClick={handleGenerateAltText}
          disabled={selectedImages.length === 0}
        >
          Generate Alt Text for selected
        </button>
      </div>

      <div className="mt-8 bg-green-100 border-l-4 border-green-500 p-4">
        <h3 className="font-bold">Note</h3>
        <p>When you generate alt text for scraped images, they will be processed in the background and added to your library when done. Some images may not be processed if they are an unsupported file type or are unable to be downloaded. Page scrapes are limited to a maximum of 512 images.</p>
      </div>
    </div>
  );
};

export default ScrapedImages;
