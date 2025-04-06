import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getUserId } from '../../AuthContext/AuthContext';

const ReelGenerator = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [captionedImages, setCaptionedImages] = useState([]);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [remainingCredits, setRemainingCredits] = useState(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('original'); // 'original' or 'captioned'
  const [captionPrompt, setCaptionPrompt] = useState('');
  const [creditUpdateTrigger, setCreditUpdateTrigger] = useState(0);

  // Fetch remaining credits when component mounts or creditUpdateTrigger changes
  useEffect(() => {
    fetchRemainingCredits();
  }, [creditUpdateTrigger]);

  // Function to fetch remaining credits
  const fetchRemainingCredits = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
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
      console.error('Error fetching credits:', error);
    }
  };

  // Handle multiple image selection
  const handleImagesSelect = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    // Validate each file - updated to 10MB
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 10MB`);
        return false;
      }
      return true;
    });

    setSelectedImages(validFiles);
    setCaptionedImages([]); // Reset captioned images when new images are selected
    
    // Create preview URLs
    const previewUrls = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(previewUrls);
  };

  // Handle music upload
  const handleMusicSelect = (event) => {
    const file = event.target.files[0];
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Music file should be less than 10MB');
      return;
    }
    setSelectedMusic(file);
  };

  // Generate captions for all images
  const handleGenerateCaptions = async () => {
    if (selectedImages.length === 0) {
      toast.warning('Please select images first');
      return;
    }

    // Check if user has enough credits
    if (remainingCredits < selectedImages.length) {
      toast.error(`Not enough credits. You need ${selectedImages.length} credits but have ${remainingCredits}`);
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    const captionedUrls = [];
    let successfulCaptions = 0;

    try {
      // First deduct the credits
      const creditResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/credits/deduct`,
        {
          usedCredits: selectedImages.length
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!creditResponse.data.success) {
        toast.error('Failed to deduct credits');
        setIsProcessing(false);
        return;
      }

      // Force a refresh of credits
      setCreditUpdateTrigger(prev => prev + 1);

      // Process each image
      for (let i = 0; i < selectedImages.length; i++) {
        const formData = new FormData();
        formData.append('image', selectedImages[i]);
        formData.append('userId', getUserId());
        
        // Add the caption prompt if provided
        if (captionPrompt.trim()) {
          formData.append('prompt', captionPrompt);
        }

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/images/generate-styled-caption`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.success) {
          captionedUrls.push(response.data.captionedImage);
          successfulCaptions++;
        }

        setProgress(((i + 1) / selectedImages.length) * 100);
      }

      // If any captions failed, refund those credits
      if (successfulCaptions < selectedImages.length) {
        const refundAmount = selectedImages.length - successfulCaptions;
        await axios.post(
          `${process.env.REACT_APP_API_URL}/credits/refund`,
          {
            refundCredits: refundAmount
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        toast.warning(`Refunded ${refundAmount} credits for failed captions`);
      }

      setCaptionedImages(captionedUrls);
      setActiveTab('captioned'); // Switch to captioned view after generation
      toast.success('All captions generated successfully!');
      
      // Refresh credits after operation is complete
      setCreditUpdateTrigger(prev => prev + 1);
    } catch (error) {
      // If error occurs, attempt to refund all credits
      try {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/credits/refund`,
          {
            refundCredits: selectedImages.length - successfulCaptions
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setCreditUpdateTrigger(prev => prev + 1);
      } catch (refundError) {
        console.error('Error refunding credits:', refundError);
      }
      
      toast.error('Failed to generate captions');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate and download reel
  const handleCreateReel = async () => {
    try {
      setIsProcessing(true);
      setProgress(0);
      const formData = new FormData();
      
      // Add audio file
      formData.append('audioFile', selectedMusic);

      // Add images
      captionedImages.forEach((img) => {
        formData.append('images', img.url);
      });

      toast.info('Creating reel, this may take a moment...');

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/images/createReels`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          responseType: 'blob', // Important for receiving the video file
          onUploadProgress: (progressEvent) => {
            const uploadPercentage = Math.round((progressEvent.loaded * 30) / progressEvent.total);
            setProgress(uploadPercentage); // First 30% for upload
          }
        }
      );

      // Set progress to 100% for download
      setProgress(100);

      // Create and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reel.mp4');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Reel downloaded successfully!');
    } catch (error) {
      console.error('Error creating reel:', error);
      toast.error('Failed to create reel');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">AI Reel Generator</h1>
        
        {/* Credits Display */}
        {remainingCredits !== null && (
          <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-4">
            <p className="font-semibold text-red-600">
              You have {remainingCredits} image {remainingCredits === 1 ? 'credit' : 'credits'} remaining
            </p>
            <p className="text-sm text-gray-700 mt-1">
              Each image uses 1 credit. Creating a reel requires captioned images first.
            </p>
          </div>
        )}

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Images (Max 5 images, 10MB each)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesSelect}
            className="w-full p-2 border rounded-md"
            disabled={isProcessing}
          />
        </div>

        {/* Tab Navigation */}
        {(imagePreviewUrls.length > 0 || captionedImages.length > 0) && (
          <div className="mb-4 border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('original')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'original'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Original Images
              </button>
              <button
                onClick={() => setActiveTab('captioned')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'captioned'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                disabled={captionedImages.length === 0}
              >
                Captioned Images
              </button>
            </nav>
          </div>
        )}

        {/* Image Previews - Conditionally render based on active tab */}
        {activeTab === 'original' && imagePreviewUrls.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="border rounded-lg p-2">
                <img src={url} alt={`Preview ${index + 1}`} className="w-full h-auto" />
                <p className="text-sm text-center text-gray-500 mt-2">Original Image {index + 1}</p>
              </div>
            ))}
          </div>
        )}

        {/* Captioned Image Previews */}
        {activeTab === 'captioned' && captionedImages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {captionedImages.map((img, index) => (
              <div key={index} className="border rounded-lg p-2">
                <img src={img.url} alt={`Captioned ${index + 1}`} className="w-full h-auto" />
                <p className="text-sm text-center text-gray-500 mt-2">Captioned Image {index + 1}</p>
              </div>
            ))}
          </div>
        )}

        {/* Music Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Music (Max 10MB)
          </label>
          <input
            type="file"
            accept="audio/*"
            onChange={handleMusicSelect}
            className="w-full p-2 border rounded-md"
            disabled={isProcessing}
          />
          {selectedMusic && (
            <p className="text-sm text-gray-500 mt-1">
              Selected: {selectedMusic.name}
            </p>
          )}
        </div>

        {/* Caption Prompt Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Caption Prompt (Optional)
          </label>
          <textarea
            value={captionPrompt}
            onChange={(e) => setCaptionPrompt(e.target.value)}
            placeholder="Enter your caption preferences here..."
            className="w-full p-2 border rounded-md h-24 resize-none"
            disabled={isProcessing}
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave this empty for AI-generated captions or specify your own exact caption text.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={handleGenerateCaptions}
            disabled={isProcessing || selectedImages.length === 0 || remainingCredits < selectedImages.length}
            className={`flex-1 py-2 px-4 rounded-md ${
              isProcessing || selectedImages.length === 0 || remainingCredits < selectedImages.length
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
            title={remainingCredits < selectedImages.length ? 'Not enough credits' : ''}
          >
            {isProcessing && activeTab === 'original' ? 'Generating Captions...' : `Generate Captions (${selectedImages.length > 0 ? selectedImages.length : 0} credits)`}
          </button>
          <button
            onClick={handleCreateReel}
            disabled={isProcessing || !selectedMusic || captionedImages.length === 0}
            className={`flex-1 py-2 px-4 rounded-md ${
              isProcessing || !selectedMusic || captionedImages.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {isProcessing && activeTab === 'captioned' ? 'Creating Reel...' : 'Create & Download Reel'}
          </button>
        </div>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center mt-2">{progress.toFixed(0)}% Complete</p>
          </div>
        )}

        {/* Status and Instructions */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-medium text-gray-700">How it works:</h3>
          <ol className="mt-2 ml-5 list-decimal text-sm text-gray-600">
            <li>Upload up to 5 images (10MB max each)</li>
            <li>Add a caption prompt (optional)</li>
            <li>Generate AI captions (uses 1 credit per image)</li>
            <li>Review the captioned images</li>
            <li>Upload background music (10MB max)</li>
            <li>Create and download your reel</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ReelGenerator;
