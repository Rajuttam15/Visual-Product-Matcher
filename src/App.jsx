import React, { useState, useMemo } from 'react';
import { Search, Upload, Filter, Star, ExternalLink, Loader2, ImageIcon } from 'lucide-react';

const VisualProductMatcher = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    minSimilarity: 0,
    sortBy: 'similarity'
  });
  const [dragOver, setDragOver] = useState(false);

  // --- API Integration ---
  const apiKey = 'YWNjXzlkNDgyNTEzYzgwNmI3MDozNTA2ZDAzMzQ3OTFkN2E1Y2RlNTk1Mzc0MWViNjgxYw==';

  const handleImageUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    setLoading(true);
    setSearchResults([]);
    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setUploadedImage(objectUrl);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const uploadResponse = await fetch('/api/v2/uploads', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${apiKey}` },
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Image upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
      }
      
      const uploadData = await uploadResponse.json();
      if (uploadData.status && uploadData.status.type === 'error') {
        throw new Error(uploadData.status.text || 'Image upload failed after processing.');
      }
      
      const imageHash = uploadData.result.upload_id;

      const searchResponse = await fetch(`/api/v2/images-similarity/fingerprints?image_upload_id=${imageHash}&limit=50`, {
          headers: { 'Authorization': `Basic ${apiKey}` }
      });

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        throw new Error(`Similarity search failed: ${searchResponse.status} ${searchResponse.statusText} - ${errorText}`);
      }

      const searchData = await searchResponse.json();
      if (searchData.status && searchData.status.type === 'error') {
        throw new Error(searchData.status.text || 'Similarity search failed after processing.');
      }

      const formattedResults = searchData.result.distances.map((item, index) => ({
        id: item.image_id || index,
        name: `Visually Similar Result ${index + 1}`,
        image: item.image,
        similarity: Math.max(0, (100 - item.distance) / 100),
        category: 'API Result',
        price: 'N/A',
        rating: 'N/A'
      }));
      
      setSearchResults(formattedResults);

    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSearch = async () => {
      if (!imageUrl.trim()) return;

      setLoading(true);
      setSearchResults([]);
      setError(null);
      setUploadedImage(imageUrl);

      try {
          // Step 1: Register the URL with the /uploads endpoint
          const uploadResponse = await fetch(`/api/v2/uploads`, {
              method: 'POST',
              headers: {
                  'Authorization': `Basic ${apiKey}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ image_url: imageUrl })
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`URL processing failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
          }
          
          const uploadData = await uploadResponse.json();
           if (uploadData.status && uploadData.status.type === 'error') {
            throw new Error(uploadData.status.text || 'URL processing failed after submission.');
          }

          const imageHash = uploadData.result.upload_id;

          // Step 2: Use the returned upload_id for the similarity search
          const searchResponse = await fetch(`/api/v2/images-similarity/fingerprints?image_upload_id=${imageHash}&limit=50`, {
              headers: { 'Authorization': `Basic ${apiKey}` }
          });

          if (!searchResponse.ok) {
            const errorText = await searchResponse.text();
            throw new Error(`Similarity search failed: ${searchResponse.status} ${searchResponse.statusText} - ${errorText}`);
          }
          
          const searchData = await searchResponse.json();
          if (searchData.status && searchData.status.type === 'error') {
            throw new Error(searchData.status.text || 'Similarity search failed after processing.');
          }
          
          const formattedResults = searchData.result.distances.map((item, index) => ({
            id: item.image_id || index,
            name: `Visually Similar Result ${index + 1}`,
            image: item.image,
            similarity: Math.max(0, (100 - item.distance) / 100),
            category: 'API Result',
            price: 'N/A',
            rating: 'N/A'
          }));

          setSearchResults(formattedResults);

      } catch (err) {
          console.error('API Error:', err);
          setError(err.message || 'An unknown error occurred. The URL might be invalid or inaccessible.');
      } finally {
          setLoading(false);
      }
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };

  const filteredResults = useMemo(() => {
    if (!searchResults.length) return [];
    let filtered = searchResults.filter(product => product.similarity >= filters.minSimilarity);
    filtered.sort((a, b) => b.similarity - a.similarity);
    return filtered;
  }, [searchResults, filters]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 font-sans">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 tracking-tight">Visual Product Matcher</h1>
          <p className="text-lg text-gray-600">Find visually similar products by uploading an image</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload an Image
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                  dragOver ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300'
                }`}
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Drag & drop an image here, or</p>
                <input
                  type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])}
                  className="hidden" id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer shadow-sm transition-transform hover:scale-105"
                >
                  Choose File
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Paste Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <button
                  onClick={handleUrlSearch} disabled={!imageUrl.trim() || loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-transform hover:scale-105"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {uploadedImage && (
            <div className="mt-6 text-center">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Your Image</h3>
              <div className="inline-block bg-gray-100 p-4 rounded-lg shadow-inner">
                <img
                  src={uploadedImage} alt="Uploaded" className="max-w-xs max-h-48 object-contain rounded-lg"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2E3YWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBsb2FkIGZhaWxlZDwvdGV4dD48L3N2Zz4=';
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Analyzing image and finding matches...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-12 bg-red-50 text-red-700 rounded-lg max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold mb-2">An Error Occurred</h3>
            <p className="px-4">{error}</p>
          </div>
        )}

        {searchResults.length > 0 && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-700">Filters:</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Min Similarity:</span>
                <input
                  type="range" min="0" max="1" step="0.05" value={filters.minSimilarity}
                  onChange={(e) => setFilters(prev => ({...prev, minSimilarity: parseFloat(e.target.value)}))}
                  className="w-32"
                />
                <span className="text-sm font-semibold text-gray-800 w-10">{Math.round(filters.minSimilarity * 100)}%</span>
              </div>
            </div>
          </div>
        )}

        {filteredResults.length > 0 && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Similar Products Found ({filteredResults.length})
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredResults.map((product) => (
                <div key={product.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                  <div className="aspect-square bg-gray-200 relative">
                    <img
                      src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy"
                      onError={(e) => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5Y2E3YWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBFcnJvcjwvdGV4dD48L3N2Zz4='; }}
                    />
                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow">
                      {Math.round(product.similarity * 100)}% Match
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 truncate">{product.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-600">{product.price}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current text-yellow-500" />
                        <span className="text-sm text-gray-600">{product.rating}</span>
                      </div>
                    </div>
                    <a href={product.image} target="_blank" rel="noopener noreferrer" className="w-full mt-3 bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      View Source
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!uploadedImage && !loading && !error && (
          <div className="text-center py-20">
            <ImageIcon className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload an image to get started</h3>
            <p className="text-gray-600">Choose a file or paste an image URL to find visually similar products.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default VisualProductMatcher;

