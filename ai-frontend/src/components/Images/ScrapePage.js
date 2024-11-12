import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ScrapePage = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleScrape = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/scrape-and-generate`, { url });
      if (Array.isArray(response.data) && response.data.length > 0) {
        navigate('/scraped-images', { state: { scrapedImages: response.data, url } });
      } else {
        console.error('Unexpected response format or no images found:', response.data);
        alert('No images found or unexpected response from server');
      }
    } catch (error) {
      console.error('Error scraping page:', error);
      alert('Error scraping page. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Scrape a Web Page</h1>
      <ol className="list-decimal list-inside mb-4">
        <li>Enter a URL or copy/paste the URL from a web page browser.</li>
        <li>Click the Scrape Page button.</li>
        <li>We will show you all the images on the page.</li>
        <li>Select the images that need alt text.</li>
      </ol>
      <div className="mb-10">  {/* Increased margin-bottom */}
        <label className="block mb-4 mt-10">Web Page URL</label>  {/* Added margin-top */}
        <input
          type="text"
          className="w-full md:w-3/4 p-2 border rounded"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/gallery.html"
        />
      </div>
      <div className="flex space-x-2">
        <button
          className={`bg-indigo-600 text-white px-4 py-2 rounded-md ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleScrape}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Scraping...
            </>
          ) : 'Scrape Page'}
        </button>
        <button
          className="text-indigo-600 px-4 py-2 rounded-md border border-indigo-600"
          onClick={() => navigate('/images')}
        >
          Cancel
        </button>
      </div>
      {isLoading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg flex flex-col items-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
            <h2 className="text-center text-xl font-semibold">Scraping Page...</h2>
            <p className="text-center">This may take a few moments.</p>
          </div>
        </div>
      )}
      <p className="mt-10 text-sm text-black-600 font-bold italic">
        <em><strong>Note: Our crawler only extracts img elements from the HTML, and does not execute any script tags or javascript code.</strong></em>
      </p>
    </div>
  );
};

export default ScrapePage;
