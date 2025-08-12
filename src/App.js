import React, { useState } from 'react';
import BannerForm from './BannerForm';
import { generateBanner } from './GenerateBanner'; 
import './App.css';

const App = () => {
    const [bannerData, setBannerData] = useState(null);

    const handleGenerate = async (data) => {
        try {
            const { jpgDataUrl, title } = await generateBanner(data);
            setBannerData({
                ...data,
                imageUrl: jpgDataUrl,
                title: title
            });
        } catch (error) {
            console.error('Error generating banner:', error);
        }
    };

    const handleDownload = () => {
        if (bannerData && bannerData.imageUrl) {
            const link = document.createElement('a');
            link.href = bannerData.imageUrl;
            link.download = 'banner.jpg';
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
                <h2>{bannerData.title.replace(/_/g, ' ')}</h2>
                <img src={bannerData.imageUrl} alt="Generated Banner" className="banner-image" />
                <div>
                    <button className="new-banner-button" onClick={() => setBannerData(null)}>Generate New Banner</button>
                    <button className="button" onClick={handleDownload}>Download</button>
                </div>
              </div>
          )}
      </div>
    );
  
};

export default App;
