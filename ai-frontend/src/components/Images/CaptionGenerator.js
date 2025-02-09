import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getUserId } from '../../AuthContext/AuthContext';
import { useNavigate } from 'react-router-dom';

// Spinner Component
const Spinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const CaptionGenerator = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [captionedImage, setCaptionedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [captionPrompt, setCaptionPrompt] = useState('');
  const [remainingCredits, setRemainingCredits] = useState(null);
  const [creditUpdateTrigger, setCreditUpdateTrigger] = useState(0);

  // Fetch remaining credits when component mounts or creditUpdateTrigger changes
  useEffect(() => {
    fetchRemainingCredits();
  }, [creditUpdateTrigger]);

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
      if (error.response?.status === 401) {
        navigate('/login');
      }
      console.error('Error fetching credits:', error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setCaptionedImage(null);
    }
  };

  const handleGenerateCaption = async () => {
    if (!selectedFile) {
      toast.warning('Please select an image first');
      return;
    }

    if (remainingCredits < 1) {
      toast.error('You have no credits remaining. Please upgrade your plan.');
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('userId', getUserId());
      if (captionPrompt.trim()) {
        formData.append('prompt', captionPrompt);
      }

      // First deduct the credit
      const creditResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/credits/deduct`,
        {
          usedCredits: 1
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (creditResponse.data.success) {
        // Force a refresh of credits
        setCreditUpdateTrigger(prev => prev + 1);

        // Then generate the caption
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/images/generate-styled-caption`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(progress);
            }
          }
        );

        if (response.data.success) {
          setCaptionedImage(response.data.captionedImage);
          toast.success('Caption generated successfully!');
          // Force another refresh of credits after successful generation
          setCreditUpdateTrigger(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      // If caption generation fails, refund the credit and refresh credits
      try {
        const refundResponse = await axios.post(
          `${process.env.REACT_APP_API_URL}/credits/refund`,
          {
            refundCredits: 1
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        if (refundResponse.data.success) {
          setCreditUpdateTrigger(prev => prev + 1);
        }
      } catch (refundError) {
        console.error('Error refunding credit:', refundError);
      }
      toast.error('Failed to generate caption');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!captionedImage) {
      toast.warning('Please generate a caption first');
      return;
    }

    try {
      const response = await axios.get(captionedImage.url, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'captioned-image.jpg');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">AI Caption Generator</h1>
        
        {/* Credits Display */}
        {remainingCredits !== null && (
          <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-4">
            <p className="font-semibold text-red-600">
              You have {remainingCredits} image {remainingCredits === 1 ? 'credit' : 'credits'} remaining
            </p>
          </div>
        )}

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Image (Max 5MB)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Image Preview and Result Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          {/* Source Image */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-medium mb-2">Source Image</h2>
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-auto rounded-lg shadow"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">No image selected</p>
              </div>
            )}
          </div>

          {/* Captioned Image */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-medium mb-2">Captioned Image</h2>
            {isProcessing ? (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                <Spinner />
                <p className="text-gray-600 mt-4">Generating Captioned Image...</p>
              </div>
            ) : captionedImage ? (
              <img
                src={captionedImage.url}
                alt="Captioned"
                className="w-full h-auto rounded-lg shadow"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Caption not generated yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Caption Prompt Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Caption Prompt
          </label>
          <textarea
            value={captionPrompt}
            onChange={(e) => setCaptionPrompt(e.target.value)}
            placeholder="Enter your caption prompt here..."
            className="w-full p-2 border rounded-md h-24 resize-none"
          />
        </div>

        {/* Buttons Container */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={handleGenerateCaption}
            disabled={!selectedFile || isProcessing}
            className={`flex-1 py-2 px-4 rounded-md ${
              isProcessing || !selectedFile
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-medium flex items-center justify-center gap-2`}
          >
            {isProcessing && <Spinner />}
            {isProcessing ? 'Generating Caption...' : 'Generate Caption'}
          </button>

          <button
            onClick={handleDownload}
            disabled={!captionedImage}
            className={`flex-1 py-2 px-4 rounded-md ${
              !captionedImage
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } text-white font-medium`}
          >
            Download Captioned Image
          </button>
        </div>

        {/* Processing Progress */}
        {isProcessing && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              {progress}% Complete
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaptionGenerator;