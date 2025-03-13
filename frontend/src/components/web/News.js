import React, { useEffect, useState } from 'react';

const NewsCardGrid = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null); 

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/news/news-events');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setNews(data);

        if (data.length > 0) {
          setSelectedNews(data[0]); 
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleNewsClick = (item) => {
    setSelectedNews(item); // Set the selected news item
    window.scrollTo(0, 0); // Scroll to the top of the page
  };

  const handleCloseDetails = () => {
    setSelectedNews(null); // Close the details
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="py-10 mt-20 ">
      {/* Selected News Detail at the Top */}
      {selectedNews ? (
        <div className="bg-[#F5F5F5] shadow-md rounded-lg p-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{selectedNews.title}</h1>
          <img alt={selectedNews.title} className="w-full h-64 object-cover rounded-lg mt-4" src={selectedNews.imageUrl} />
          <p className="text-gray-700 mt-2">{selectedNews.description}</p>
          <button className="mt-4 px-4 py-2 bg-[#1E467A] text-white rounded-lg" onClick={handleCloseDetails}>
            Close Details
          </button>
        </div>
      ) : (
        <div className="bg-[#F5F5F5] shadow-md rounded-lg p-4 mb-6">
          <p>Select a news item to view details.</p>
        </div>
      )}

      {/* Grid of News Cards Below the Detail */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {news
          .filter(item => !selectedNews || item._id !== selectedNews._id) // Filter out the selected news
          .map((item) => (
            <div
              key={item._id}
              className="bg-[#F5F5F5] shadow-md rounded-lg overflow-hidden cursor-pointer"
              onClick={() => handleNewsClick(item)}
            >
              <img alt={item.title} className="w-full h-48 object-cover" src={item.imageUrl} />
              <div className="p-2 bg-[#1E467A] text-white text-center">
                <h2 className="font-bold text-lg hover:underline">{item.title}</h2>
                <p className="mt-2">{item.description}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default NewsCardGrid;
