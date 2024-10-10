import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Make sure to import axios if you're using it for API calls

const ScrapedImages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedImages, setSelectedImages] = useState([]);
  const scrapedImages = location.state?.scrapedImages || [];
  const [altTextLanguage, setAltTextLanguage] = useState('English');
  const [ecommerceData, setEcommerceData] = useState(false);
  const [seoKeywords, setSeoKeywords] = useState(false);
  const [chatGPTModification, setChatGPTModification] = useState(false);
  const [overwriteExisting, setOverwriteExisting] = useState(false);

  const handleImageSelect = (image) => {
    setSelectedImages(prev => 
      prev.includes(image) ? prev.filter(img => img !== image) : [...prev, image]
    );
  };

  const handleGenerateAltText = async () => {
    try {
      // Here you would typically call your API to generate alt text
      // For example:
      // const response = await axios.post('/api/generate-alt-text', { images: selectedImages });
      
      console.log('Generating alt text for selected images');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // After successful generation, redirect to Images page
      navigate('/images', { 
        state: { 
          message: 'Alt text generated successfully!',
          // You might want to pass the updated images here
          // updatedImages: response.data 
        } 
      });
    } catch (error) {
      console.error('Error generating alt text:', error);
      alert('Error generating alt text. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Select Images to Process</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => navigate('/scrape')}
        >
          New Page Scrape
        </button>
      </div>

      <div className="mb-4">
        <h2 className="font-bold">Summary:</h2>
        <p>{location.state?.url || 'URL not provided'}</p>
        <p>Total Scraped Images: {scrapedImages.length} Images Missing Alt Text: {scrapedImages.filter(img => !img.altText).length}</p>
      </div>

      <div className="mb-4">
        <button className="mr-2">↓ Jump to bottom</button>
        <span className="mr-2">Select:</span>
        <button className="mr-2">All</button>
        <button className="mr-2">None</button>
        <button>Missing alt text</button>
      </div>

      <table className="w-full mb-4">
        <thead>
          <tr>
            <th></th>
            <th>#</th>
            <th>IMAGE</th>
            <th>EXISTING ALT TEXT</th>
          </tr>
        </thead>
        <tbody>
          {scrapedImages.map((image, index) => (
            <tr key={index}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedImages.includes(image)}
                  onChange={() => handleImageSelect(image)}
                />
              </td>
              <td>{index + 1}</td>
              <td>{image.filename}</td>
              <td>{image.altText || 'No alt text'}</td>
            </tr>
          ))}
        </tbody>
      </table>

       <div className="mb-4">
        <h2 className="font-bold mb-2">Alt Text generation options</h2>
        <div className="mb-2">
          <label className="block">Alt Text Language</label>
          <select
            value={altTextLanguage}
            onChange={(e) => setAltTextLanguage(e.target.value)}
            className="border rounded p-1"
          >
            <option>English</option>
             Add more language options as needed 
          </select>
        </div>
        <div className="mb-2">
          <label>
            <input
              type="checkbox"
              checked={ecommerceData}
              onChange={() => setEcommerceData(!ecommerceData)}
            />
            Ecommerce Data
          </label>
          <p className="text-sm text-gray-600">Add specific product data to be used in the alt text.</p>
        </div>
        <div className="mb-2">
          <label>
            <input
              type="checkbox"
              checked={seoKeywords}
              onChange={() => setSeoKeywords(!seoKeywords)}
            />
            SEO Keywords
          </label>
          <p className="text-sm text-gray-600">Include SEO keywords in the generated alt text for the selected images.</p>
        </div>
        <div className="mb-2">
          <label>
            <input
              type="checkbox"
              checked={chatGPTModification}
              onChange={() => setChatGPTModification(!chatGPTModification)}
            />
            ChatGPT Modification
          </label>
          <p className="text-sm text-gray-600">Use your own ChatGPT prompt on the alt text.</p>
        </div>
        <div className="mb-2">
          <label>
            <input
              type="checkbox"
              checked={overwriteExisting}
              onChange={() => setOverwriteExisting(!overwriteExisting)}
            />
            Overwrite existing
          </label>
        </div>
      </div> 

      <button
        className="bg-indigo-600 text-white px-4 py-2 rounded"
        onClick={handleGenerateAltText}
      >
        Generate Alt Text for selected
      </button>

      <div className="mt-10 p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-700 font-bold">Note:</p>
        <p className="text-sm text-gray-600">
          When you generate alt text for scraped images, they will be processed in the background and added to your library when done. Some images may not be processed if they are an unsupported file type or are unable to be downloaded. Page scrapes are limited to a maximum of 512 images.
        </p>
      </div>
    </div>
  );
};

export default ScrapedImages;
