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

const ImageEditor = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editedImage, setEditedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [editPrompt, setEditPrompt] = useState('');
  const [remainingCredits, setRemainingCredits] = useState(null);
  const [creditUpdateTrigger, setCreditUpdateTrigger] = useState(0);
  const [quality, setQuality] = useState('high');

  // Calculate required credits based on quality
  const getRequiredCredits = () => {
    switch(quality) {
      case 'high': return 25;
      case 'medium': return 10;
      case 'low': return 5;
      default: return 25;
    }
  };

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

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setEditedImage(null);
    }
  };

  const handleEditImage = async () => {
    if (!selectedImage) {
      toast.warning('Please select an image first');
      return;
    }

    if (!editPrompt.trim()) {
      toast.warning('Please enter an edit prompt');
      return;
    }

    const requiredCredits = getRequiredCredits();
    if (remainingCredits < requiredCredits) {
      toast.error(`You need ${requiredCredits} credits for a ${quality} quality edit. You have ${remainingCredits} credits.`);
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('userId', getUserId());
      formData.append('prompt', editPrompt);
      formData.append('quality', quality);

      // First deduct the credits
      const creditResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/credits/deduct`,
        {
          usedCredits: requiredCredits
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

        // Then edit the image
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/images/edit-image`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 50) / progressEvent.total);
              setProgress(progress);
            }
          }
        );

        if (response.data.success) {
          setEditedImage(response.data.editedImage);
          toast.success('Image edited successfully!');
          // Force another refresh of credits after successful generation
          setCreditUpdateTrigger(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      // If image editing fails, refund the credits and refresh credits
      try {
        const refundResponse = await axios.post(
          `${process.env.REACT_APP_API_URL}/credits/refund`,
          {
            refundCredits: getRequiredCredits()
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
        console.error('Error refunding credits:', refundError);
      }
      toast.error('Failed to edit image: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!editedImage) {
      toast.warning('Please edit an image first');
      return;
    }

    try {
      const response = await axios.get(editedImage.url, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'edited-image.png');
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
        <h1 className="text-2xl font-bold mb-6">AI Image Editor</h1>
        
        {/* Credits Display */}
        {remainingCredits !== null && (
          <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-4">
            <p className="font-semibold text-red-600">
              You have {remainingCredits} image {remainingCredits === 1 ? 'credit' : 'credits'} remaining
            </p>
            <p className="text-sm text-gray-700 mt-1">
              Credit costs: High quality: 25 credits/edit, Medium: 10 credits/edit, Low: 5 credits/edit
            </p>
          </div>
        )}

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Image to Edit (Max 10MB)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Quality Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image Quality
          </label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="high">High (25 credits)</option>
            <option value="medium">Medium (10 credits)</option>
            <option value="low">Low (5 credits)</option>
          </select>
        </div>

        {/* Image Previews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          {/* Source Image */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-medium mb-2">Source Image</h2>
            <div className="space-y-4">
              {imagePreview ? (
                <div>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-auto rounded-lg shadow mt-1"
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">No image selected</p>
                </div>
              )}
            </div>
          </div>

          {/* Edited Image */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-medium mb-2">Edited Image</h2>
            {isProcessing ? (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                <Spinner />
                <p className="text-gray-600 mt-4">Editing Image...</p>
              </div>
            ) : editedImage ? (
              <img
                src={editedImage.url}
                alt="Edited"
                className="w-full h-auto rounded-lg shadow"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Image not edited yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Prompt Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Edit Prompt
          </label>
          <textarea
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            placeholder="Describe the edits you want to make to the image..."
            className="w-full p-2 border rounded-md h-24 resize-none"
          />
        </div>

        {/* Buttons Container */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={handleEditImage}
            disabled={!selectedImage || !editPrompt.trim() || isProcessing || remainingCredits < getRequiredCredits()}
            className={`flex-1 py-2 px-4 rounded-md ${
              !selectedImage || !editPrompt.trim() || isProcessing || remainingCredits < getRequiredCredits()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-medium flex items-center justify-center gap-2`}
          >
            {isProcessing && <Spinner />}
            {isProcessing ? 'Editing Image...' : `Edit Image (${getRequiredCredits()} credits)`}
          </button>

          <button
            onClick={handleDownload}
            disabled={!editedImage}
            className={`flex-1 py-2 px-4 rounded-md ${
              !editedImage
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } text-white font-medium`}
          >
            Download Edited Image
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

        {/* Instructions */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700">How to use the image editor:</h3>
          <ol className="mt-2 ml-5 list-decimal text-sm text-gray-600">
            <li>Upload an image you want to edit</li>
            <li>Enter a prompt describing how you want to transform the image</li>
            <li>Choose the quality level (higher quality uses more credits)</li>
            <li>Click "Edit Image" to generate the transformed version</li>
          </ol>
          <p className="mt-2 text-sm text-gray-600">
            <strong>Tip:</strong> Be specific in your prompts to get the best results.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;