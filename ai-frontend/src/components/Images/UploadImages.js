import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getUserId } from '../../AuthContext/AuthContext';
import { FaCloudUploadAlt } from 'react-icons/fa';

const UploadImages = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [chatGptPrompt, setChatGptPrompt] = useState('');
  const [remainingCredits, setRemainingCredits] = useState(null);
  const navigate = useNavigate();

  // Fetch remaining credits when component mounts
  useEffect(() => {
    fetchRemainingCredits();
  }, []);

  // Function to fetch remaining credits
  const fetchRemainingCredits = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/credits/remaining`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setRemainingCredits(response.data.imageCredits);
      }
    } catch (error) {
      console.error('Auth Error Details:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handlePromptChange = (event) => {
    setChatGptPrompt(event.target.value);
  };

  const handleGenerateAltText = async () => {
    try {
      setUploading(true);
      setError(null);
      const userId = getUserId();

      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });
      formData.append('userId', userId);
      formData.append('chatGptPrompt', chatGptPrompt);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/images/upload-and-generate`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setRemainingCredits(response.data.remainingCredits);
        navigate('/images');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 'Failed to upload and process images');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Upload Images</h1>
        
        {/* Credits Display */}
        {remainingCredits !== null && (
          <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-4">
            <p className="font-semibold text-red-600">
              You have {remainingCredits} image {remainingCredits === 1 ? 'credit' : 'credits'} remaining
            </p>
          </div>
        )}

        {/* Warning if selected files exceed credits */}
        {remainingCredits !== null && selectedFiles.length > remainingCredits && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">
              You have selected {selectedFiles.length} images but only have {remainingCredits} credits remaining. 
              Please select fewer images or upgrade your plan.
            </p>
          </div>
        )}

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <FaCloudUploadAlt className="text-4xl text-gray-400 mb-2" />
            <span className="text-gray-600">Click to upload images or drag and drop</span>
          </label>
        </div>

        {selectedFiles.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Selected Images:</h2>
              <ul className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="text-gray-700">{file.name}</li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <label htmlFor="chatGptPrompt" className="block text-lg font-medium text-gray-700 mb-2">
                ChatGPT Modification (optional)
              </label>
              <textarea
                id="chatGptPrompt"
                name="chatGptPrompt"
                value={chatGptPrompt}
                onChange={handlePromptChange}
                placeholder="for eg: Generate alt text for the following images with a name of the product"
                rows="4"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              ></textarea>
              <p className="mt-2 text-sm text-gray-600">
                Use your own prompt to advise ChatGPT on how to generate alt text.
              </p>
            </div>
          </>
        )}

        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}

        <button
          className={`bg-indigo-600 text-white px-6 py-2 rounded w-full ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleGenerateAltText}
          disabled={selectedFiles.length === 0 || uploading}
        >
          {uploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Generate Alt Text'
          )}
        </button>
      </div>

      {uploading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg flex flex-col items-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4">
              <style jsx>{`
                .loader {
                  border-top-color: #4f46e5;
                  -webkit-animation: spinner 1.5s linear infinite;
                  animation: spinner 1.5s linear infinite;
                }
                @-webkit-keyframes spinner {
                  0% { -webkit-transform: rotate(0deg); }
                  100% { -webkit-transform: rotate(360deg); }
                }
                @keyframes spinner {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
            <h2 className="text-center text-xl font-semibold">Generating Alt Text...</h2>
            <p className="text-center">This may take a few moments.</p>
          </div>
        </div>
      )}

      <div className="mt-8 bg-green-100 border-l-4 border-green-500 p-4">
        <h3 className="font-bold">Note</h3>
        <p>When you generate alt text for uploaded images, they will be processed in the background and added to your library when done. Some images may not be processed if they are an unsupported file type.</p>
      </div>
    </div>
  );
};

export default UploadImages;
