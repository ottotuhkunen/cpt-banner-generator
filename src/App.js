// src/App.js
import React, { useState } from 'react';
import BannerForm from './BannerForm';
import { generateBanner } from './GenerateBanner';  // Import the generateBanner function
import './App.css';  // Import the CSS file for styling

const App = () => {
    const [bannerData, setBannerData] = useState(null);

    const handleGenerate = async (data) => {
        try {
            // Call the generateBanner function and wait for the PNG data URL
            const pngDataUrl = await generateBanner(data);

            // Update the state with the new banner data including the PNG image URL
            setBannerData({
                ...data,
                imageUrl: pngDataUrl
            });
        } catch (error) {
            console.error('Error generating banner:', error);
        }
    };

    const handleDownload = () => {
        if (bannerData && bannerData.imageUrl) {
            // Create a link element
            const link = document.createElement('a');
            link.href = bannerData.imageUrl;
            link.download = 'banner.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
      <div className="banner-container">
          {!bannerData ? (
              <BannerForm onGenerate={handleGenerate} />
          ) : (
              <div className='output-container'>
                  <img src={bannerData.imageUrl} alt="Generated Banner" className="banner-image" />
                  <div>
                      <button className="button" onClick={handleDownload}>Download</button>
                      <button className="new-banner-button" onClick={() => setBannerData(null)}>Generate New Banner</button>
                  </div>
              </div>
          )}
      </div>
  );
  
};

export default App;
