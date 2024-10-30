import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUserId } from '../../AuthContext/AuthContext';

const ScrapedImages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [remainingCredits, setRemainingCredits] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [scrapedImages, setScrapedImages] = useState([]);
  const [url, setUrl] = useState('');
  const [chatGptPrompt, setChatGptPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (location.state?.scrapedImages) {
      setScrapedImages(location.state.scrapedImages);
    }
    if (location.state?.url) {
      setUrl(location.state.url);
    }
  }, [location.state]);

  // Fetch remaining credits when component mounts
  useEffect(() => {
    fetchRemainingCredits();
  }, []);

  // Function to fetch remaining credits
  const fetchRemainingCredits = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Add debug logs
      console.log('Token exists:', !!token);
      console.log('Token value:', token?.substring(0, 20) + '...'); // Show first 20 chars for safety
      
      if (!token) {
        navigate('/login'); // Redirect to login if no token
        return;
      }

      const response = await axios.get('http://localhost:3001/api/v1/credits/remaining', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        console.log('Remaining credits:', response.data.imageCredits);
        setRemainingCredits(response.data.imageCredits);
      }
    } catch (error) {
      console.error('Auth Error Details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message
      });
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

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

  const handlePromptChange = (event) => {
    setChatGptPrompt(event.target.value);
  };

  // Handle alt text generation
  const handleGenerateAltText = async () => {
    // Validate credit availability
    if (remainingCredits === null) {
      alert('Unable to determine remaining credits. Please refresh the page.');
      return;
    }

    if (selectedImages.length > remainingCredits) {
      alert(`You only have ${remainingCredits} credits remaining. Please select fewer images.`);
      return;
    }

    try {
      setIsGenerating(true);

      // First generate the alt text
      const altTextResponse = await axios.post(
        'http://localhost:3001/api/v1/images/generate-alt-text',
        {
          selectedImages,
          userId: getUserId(),
          chatGptPrompt
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // If alt text generation was successful, deduct credits
      if (altTextResponse.data) {
        const creditResponse = await axios.post(
          'http://localhost:3001/api/v1/credits/deduct',
          {
            usedCredits: selectedImages.length
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (creditResponse.data.success) {
          // Update local state with new credit count
          setRemainingCredits(creditResponse.data.remainingCredits);
          
          // Navigate to results
          navigate('/images', { 
            state: { 
              generatedImages: altTextResponse.data,
              message: creditResponse.data.message 
            } 
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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
        <h1 className="text-2xl font-bold">Select Images to Generate AltText</h1>
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

      {/* Credits Display */}
      {remainingCredits !== null && (
        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-4">
          <p className="font-semibold text-red-600">
            You have {remainingCredits} image {remainingCredits === 1 ? 'credit' : 'credits'} remaining
          </p>
        </div>
      )}

      {/* Warning if selected images exceed credits - Moved here */}
      {remainingCredits !== null && selectedImages.length > remainingCredits && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">
            You have selected {selectedImages.length} images but only have {remainingCredits} credits remaining. 
            Please adjust your selection or upgrade your plan.
          </p>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        {/* <button className="text-indigo-600 underline">Jump to bottom</button>
        <div>
          <span className="mr-2">Select:</span>
          <button className="text-indigo-600 underline mr-2" onClick={handleSelectAll}>All</button>
          <button className="text-indigo-600 underline mr-2" onClick={handleSelectNone}>None</button>
          <button className="text-indigo-600 underline" onClick={handleSelectMissingAltText}>Missing alt text</button>
        </div> */}
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
        {/* <div className="mb-4">
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
        </div> */}
        <div className="mb-4">
          <label htmlFor="chatGptPrompt" className="block text-lg font-medium text-gray-700 mb-2">
            ChatGPT Modification (optional)
          </label>
          <textarea
            id="chatGptPrompt"
            name="chatGptPrompt"
            value={chatGptPrompt}
            onChange={handlePromptChange}
            placeholder="for eg: Generate alt text for the followng images with a name of the product"
            rows="4"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          ></textarea>
          <p className="mt-2 text-sm text-gray-600">Use your own prompt to advice ChatGPT on how to generate alt text.</p>
        </div>
        {/* <div className="mb-4">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            Overwrite existing
          </label>
        </div> */}
        <button
          className={`bg-indigo-600 text-white px-4 py-2 rounded ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleGenerateAltText}
          disabled={selectedImages.length === 0 || isGenerating}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Alt Text for selected'
          )}
        </button>
      </div>

      <div className="mt-8 bg-green-100 border-l-4 border-green-500 p-4">
        <h3 className="font-bold">Note</h3>
        <p>When you generate alt text for scraped images, they will be processed in the background and added to your library when done. Some images may not be processed if they are an unsupported file type or are unable to be downloaded. Page scrapes are limited to a maximum of 200 images.</p>
      </div>

      {isGenerating && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg flex flex-col items-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
            <h2 className="text-center text-xl font-semibold">Generating Alt Text...</h2>
            <p className="text-center">This may take a few moments.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrapedImages;
