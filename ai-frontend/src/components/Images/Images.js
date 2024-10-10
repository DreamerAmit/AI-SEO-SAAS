import React, { useState, useEffect } from 'react';
import { FaPlus, FaFileImport, FaFileExport } from 'react-icons/fa';
import { BsGlobe } from 'react-icons/bs';
import { useNavigate, useLocation } from 'react-router-dom';

const Images = () => {
  const [selectedCount, setSelectedCount] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [images, setImages] = useState([
    {
      id: '65d9b1cf8049...',
      url: '(direct upload)',
      altText: 'A LinkedIn post by Amit Mahajan promoting Make.com. The post highlights how Make.com streamlines business workflows with customizable automation tools, enhancing efficiency and productivity. The post includes hashtags, has 55 impressions so far, and provides view analytics option.',
      dateUpdated: '20 days ago'
    }
  ]);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if there are scraped images from the ScrapePage
    if (location.state && location.state.scrapedImages) {
      setImages(prevImages => [...prevImages, ...location.state.scrapedImages]);
      // Clear the location state to avoid duplicate additions
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleSearch = () => {
    // Implement search functionality
    console.log('Searching for:', searchText);
  };

  const handleDelete = () => {
    // Implement delete functionality
    console.log('Deleting selected images');
  };

  const handleScrapeClick = () => {
    navigate('/scrape');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Images</h1>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <div className="flex flex-wrap gap-2 mb-2 sm:mb-0">
          {/* <button className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center">
            <FaPlus className="mr-2" /> Image
          </button> */}
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center"
            onClick={handleScrapeClick}
          >
            <BsGlobe className="mr-2" /> Scrape Page
          </button>
          {/* <button className="bg-white text-gray-700 px-4 py-2 rounded-md border flex items-center">
            <FaFileImport className="mr-2" /> Import
          </button> */}
          {/* <button className="bg-white text-gray-700 px-4 py-2 rounded-md border flex items-center">
            <FaFileExport className="mr-2" /> Export
          </button> */}
        </div>
        <div className="flex space-x-2 mt-2 sm:mt-0">
          <input
            type="text"
            placeholder="Search alt text..."
            className="border rounded-md px-4 py-2"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-md"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>

      <div className="mb-24"></div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <div>Selected: {selectedCount}</div>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded-md"
            onClick={handleDelete}
            disabled={selectedCount === 0}
          >
            Delete
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600" />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asset ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                URL
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alt Text
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Updated
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {images.map((image) => (
              <tr key={image.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{image.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{image.url}</td>
                <td className="px-6 py-4">{image.altText}</td>
                <td className="px-6 py-4 whitespace-nowrap">{image.dateUpdated}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
          Displaying {images.length} item
        </div>
      </div>
    </div>
  );
};

export default Images;
