import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaEdit, FaTrash, FaCopy, FaExternalLinkAlt, FaPlus, FaFileImport, FaFileExport } from 'react-icons/fa';
import { BsClipboard } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

const Images = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/images/altText');
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to fetch images. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Implement search functionality
  };

  const handleDelete = () => {
    // Implement delete functionality
  };

  const handleCheckboxChange = (id) => {
    setSelectedImages(prev => 
      prev.includes(id) ? prev.filter(imageId => imageId !== id) : [...prev, id]
    );
  };

  const handleScrapePageClick = () => {
    navigate('/scrape');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Images</h1>
        <div className="flex space-x-2">
          {/* <button className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center">
            <FaPlus className="mr-2" />
          </button> */}
          <button className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center" onClick={handleScrapePageClick}>
            <BsClipboard className="mr-2" /> Scrape Page
          </button>
          <button className="bg-white text-black px-4 py-2 rounded border border-gray-300 flex items-center">
            <FaFileExport className="mr-2" /> Export
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider"></th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">URL</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Alt Text</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.isArray(images) && images.length > 0 ? (
              images.map((image, index) => (
                <tr key={image.id || index} className="hover:bg-gray-100">
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-black">
                    <input 
                      type="checkbox"
                      checked={selectedImages.includes(image.id)}
                      onChange={() => handleCheckboxChange(image.id)}
                      className="w-4 h-4 text-blue-600 border border-gray-300 rounded"
                    />
                  </td>
                 
                  <td className="px-6 py-3 text-sm text-black">{image.src}</td>
                  <td className="px-6 py-3 text-sm text-black word-wrap:break-words">{image.alt_text}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">No images found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Images;
