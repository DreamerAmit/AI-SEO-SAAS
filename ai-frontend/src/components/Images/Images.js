import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaEdit, FaTrash, FaCopy, FaExternalLinkAlt, FaPlus, FaFileImport, FaFileExport, FaCloudUploadAlt, FaImage, FaVideo } from 'react-icons/fa';
import { BsClipboard } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { getUserId } from '../../AuthContext/AuthContext';
import { toast } from 'react-toastify';

const Images = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(25); // New state for items per page
  const [currentPage, setCurrentPage] = useState(1); // New state for current page
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID is not available');
      }
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/images/altText`, {
        params: { userId: userId }
      });
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to fetch images. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const handleSelectAllChange = (event) => {
    if (event.target.checked) {
      setSelectedImages(paginatedImages.map(image => image.id));
    } else {
      setSelectedImages([]);
    }
  };

  const paginatedImages = images.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearch = () => {
    // Implement search functionality
  };

  const handleDelete = async () => {
    if (selectedImages.length === 0) return;

    try {
      console.log('Sending delete request...');
      const response = await axios.delete(`${process.env.REACT_APP_API_URL}/images/altText`, { 
        data: { ids: selectedImages },
        withCredentials: true
      });
      console.log('Delete response:', response);

      // Remove deleted images from the state
      setImages(prevImages => prevImages.filter(image => !selectedImages.includes(image.id)));
      // Clear selected images
      setSelectedImages([]);
      // Show success message (you can implement a toast notification here)
      alert('Selected images deleted successfully');
    } catch (error) {
      console.error('Error deleting images:', error);
      console.error('Error response:', error.response);
      // Show error message
      alert('Failed to delete images. Please try again.');
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedImages(prev => 
      prev.includes(id) ? prev.filter(imageId => imageId !== id) : [...prev, id]
    );
  };

  const handleScrapePageClick = () => {
    navigate('/scrape');
  };

  const handleUploadClick = () => {
    navigate('/upload-images');
  };

  const handleCaptionPageClick = () => {
    navigate('/caption-generator');
  };

  const handleReelPageClick = () => {
    navigate('/reel-generator');
  };

  const handleExport = () => {
    const dataToExport = selectedImages.length > 0
      ? images.filter(image => selectedImages.includes(image.id))
      : images;

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(
      dataToExport.map((image, index) => ({
        'Sr No': index + 1,
        'URL': image.src,
        'AltText': image.alt_text
      }))
    );

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Images');
    XLSX.writeFile(workbook, 'exported_images.xlsx');
  };

  const handleImageProcessing = async (images) => {
    if (!images?.length) {
      toast.warning('Please select images to process');
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(0);
      setProcessedCount(0);

      const response = await axios.post('/api/v1/generate-alt-text', {
        selectedImages: images,
        chatGptPrompt: "Generate descriptive alt text for this image"
      });

      if (response.data.success) {
        setProgress(100);
        await fetchImages(); // Make sure this exists in your component
        
        toast.success(
          `Successfully processed ${response.data.processed} images${
            response.data.failed > 0 
              ? `. ${response.data.failed} images failed.` 
              : ''
          }`
        );
      } else {
        toast.error('Failed to process images');
      }
    } catch (error) {
      console.error('Error processing images:', error);
      toast.error('Error processing images');
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProcessedCount(0);
      setSelectedImages([]);
    }
  };

  const handleCopyAltText = (altText) => {
    navigator.clipboard.writeText(altText)
      .then(() => {
        toast.success('Alt text copied!', {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
        toast.error('Failed to copy text');
      });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Images</h1>
        <div className="flex flex-wrap gap-2">
          <button className="bg-indigo-600 text-white px-3 py-2 rounded flex items-center text-sm" onClick={handleScrapePageClick}>
            <BsClipboard className="mr-1" /> Scrape
          </button>
          <button className="bg-indigo-600 text-white px-3 py-2 rounded flex items-center text-sm" onClick={handleUploadClick}>
            <FaCloudUploadAlt className="mr-1" /> Upload
          </button>
          <button className="bg-indigo-600 text-white px-3 py-2 rounded flex items-center text-sm" onClick={handleCaptionPageClick}>
            <FaEdit className="mr-1" /> Edit Image
          </button>
          <button className="bg-indigo-600 text-white px-3 py-2 rounded flex items-center text-sm" onClick={handleReelPageClick}>
            <FaVideo className="mr-1" /> Reel
          </button>
          <button 
            className="bg-white text-black px-3 py-2 rounded border border-gray-300 flex items-center text-sm"
            onClick={handleExport}
          >
            <FaFileExport className="mr-1" /> Export
          </button>
        </div>
      </div>
      {/* <div className="flex justify-end mb-4">
        <div className="flex">
          <input 
            type="text" 
            placeholder="Search alt text..." 
            className="border border-gray-300 px-4 py-2 rounded-l-md w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            className="bg-indigo-600 text-white px-4 py-2 rounded-r-md"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div> */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <span>Selected: {selectedImages.length}</span>
          <button 
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={handleDelete}
            disabled={selectedImages.length === 0}
          >
            Delete
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="w-[5%] px-2 py-3 text-center text-xs font-medium text-black uppercase tracking-wider">
                  #
                </th>
                <th scope="col" className="w-[5%] px-2 py-3 text-center text-xs font-medium text-black uppercase tracking-wider">
                  <input 
                    type="checkbox"
                    onChange={handleSelectAllChange}
                    checked={selectedImages.length === paginatedImages.length && paginatedImages.length > 0}
                    className="w-4 h-4 text-blue-600 border border-gray-300 rounded"
                  />
                </th>
                <th scope="col" className="w-[30%] px-2 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  URL
                </th>
                <th scope="col" className="w-[60%] px-2 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Alt Text
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(paginatedImages) && paginatedImages.length > 0 ? (
                paginatedImages.map((image, index) => (
                  <tr key={image.id || index} className="hover:bg-gray-100">
                    <td className="px-2 py-3 whitespace-nowrap text-sm font-medium text-black text-center">
                      {index + 1 + (currentPage - 1) * itemsPerPage}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-sm font-medium text-black text-center">
                      <input 
                        type="checkbox"
                        checked={selectedImages.includes(image.id)}
                        onChange={() => handleCheckboxChange(image.id)}
                        className="w-4 h-4 text-blue-600 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-2 py-3 text-sm text-black">
                      <div className="truncate max-w-[150px] md:max-w-[300px] hover:whitespace-normal hover:break-words">
                        {image.src}
                      </div>
                    </td>
                    <td className="px-2 py-3 text-sm text-black">
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => handleCopyAltText(image.alt_text)}
                          className="text-gray-600 hover:text-gray-800 transition-colors duration-200 mt-1 flex-shrink-0"
                          title="Copy alt text"
                        >
                          <FaCopy className="w-4 h-4" />
                        </button>
                        <div className="break-words min-w-0 flex-1">
                          {image.alt_text}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-2 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                    No images found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end p-4">
          <label htmlFor="itemsPerPage" className="mr-2">Items per page:</label>
          <select id="itemsPerPage" value={itemsPerPage} onChange={handleItemsPerPageChange} className="border border-gray-300 rounded px-2 py-1">
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
          </select>
        </div>
      </div>
      {/* <button
        onClick={() => handleImageProcessing(selectedImages)}
        disabled={!selectedImages.length || isProcessing}
        className={`bg-indigo-600 text-white px-4 py-2 rounded flex items-center ${
          (!selectedImages.length || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isProcessing ? 'Processing...' : 'Process Selected Images'}
      </button> */}

      {isProcessing && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
          <div className="text-sm font-medium mb-2">
            Processing {selectedImages.length} images...
          </div>
          <div className="w-64 bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {processedCount} of {selectedImages.length} completed
          </div>
        </div>
      )}
    </div>
  );
};

export default Images;
