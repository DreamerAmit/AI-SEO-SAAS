import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getUserId } from '../../AuthContext/AuthContext';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const UploadImages = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [chatGptPrompt, setChatGptPrompt] = useState('');
  const [remainingCredits, setRemainingCredits] = useState(null);
  const [progress, setProgress] = useState(0);
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
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      // Show error for oversized files
      toast.error(
        <div>
          <p>The following files exceed 5MB: Please upload images under 5MB</p>
          <ul className="mt-2 list-disc pl-4">
            {oversizedFiles.map(file => (
              <li key={file.name}>{file.name}</li>
            ))}
          </ul>
        </div>,
        {
          duration: 10000,
          style: {
            maxWidth: '500px',
          }
        }
      );
      
      // Only keep files under 5MB
      const validFiles = files.filter(file => file.size <= maxSize);
      setSelectedFiles(validFiles);
    } else {
      setSelectedFiles(files);
    }
  };

  const handlePromptChange = (event) => {
    setChatGptPrompt(event.target.value);
  };

  const handleGenerateAltText = async () => {
    try {
      const maxSize = 5 * 1024 * 1024;
      const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        toast.error('Some files are too large. Please remove files over 5MB.');
        return;
      }

      setUploading(true);
      setError(null);
      setProgress(0);

      const totalImages = selectedFiles.length;
      const timePerImage = 3000; // 3 seconds per image
      const totalTime = totalImages * timePerImage;
      const updateInterval = 100; // Update progress every 100ms
      let elapsedTime = 0;

      // Start progress timer
      const progressTimer = setInterval(() => {
        elapsedTime += updateInterval;
        const calculatedProgress = Math.min((elapsedTime / totalTime) * 100, 95);
        setProgress(Math.round(calculatedProgress));
      }, updateInterval);

      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });
      formData.append('userId', getUserId());
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

      // Clear progress timer
      clearInterval(progressTimer);

      if (response.data.success) {
        setProgress(100);
        setRemainingCredits(response.data.remainingCredits);
        
        // Short delay to show 100% completion
        setTimeout(() => {
          navigate('/images');
        }, 500);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 'Failed to upload and process images');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const LoadingDots = () => (
    <span className="loading-dots">
      <span className="dot dot1">.</span>
      <span className="dot dot2">.</span>
      <span className="dot dot3">.</span>
      <style jsx="true">{`
        .loading-dots {
          display: inline-block;
          margin-left: 8px;
        }
        .dot {
          opacity: 0;
          display: inline-block;
          margin-left: 4px;
          font-size: 24px;
          font-weight: bold;
          animation: showHideDot 1.5s ease-in-out infinite;
        }
        .dot1 {
          color: #3B82F6; /* blue-500 */
        }
        .dot2 {
          color: #10B981; /* emerald-500 */
        }
        .dot3 {
          color: #6366F1; /* indigo-500 */
        }
        .dot:nth-child(1) {
          animation-delay: 0s;
        }
        .dot:nth-child(2) {
          animation-delay: 0.5s;
        }
        .dot:nth-child(3) {
          animation-delay: 1s;
        }
        @keyframes showHideDot {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(0.5); }
        }
      `}</style>
    </span>
  );

  const ProcessingPopup = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-6">Processing Your Images</h2>
          
          {/* Progress Circle */}
          <div className="relative inline-flex mb-6">
            <div className="w-24 h-24">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                />
                {/* Progress circle */}
                <circle
                  className="text-blue-600"
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 42}`,
                    strokeDashoffset: `${2 * Math.PI * 42 * (1 - progress / 100)}`,
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                    transition: 'stroke-dashoffset 0.1s ease'
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-semibold">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-600">
              Processing {selectedFiles.length} {selectedFiles.length === 1 ? 'image' : 'images'}
              <LoadingDots />
            </p>
          </div>

          {/* <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
            You can safely navigate away. Your images will continue processing in the background.
          </div> */}
        </div>
      </div>
    </div>
  );

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
        <ProcessingPopup />
      )}

      <div className="mt-8 bg-green-100 border-l-4 border-green-500 p-4">
        <h3 className="font-bold">Note</h3>
        <p>When you generate alt text for uploaded images, they will be processed in the background and added to your library when done. Some images may not be processed if they are an unsupported file type or image size is greater than 5MB.</p>
      </div>
    </div>
  );
};

export default UploadImages;
