import React, { useState } from 'react';
import BannerForm from './BannerForm';
import { generateBanner } from './GenerateBanner'; 
import './App.css';

const App = () => {
    const [bannerData, setBannerData] = useState(null);

    const handleGenerate = async (data) => {
        try {
            const { pngDataUrl, title, desc } = await generateBanner(data);
            setBannerData({
                ...data,
                imageUrl: pngDataUrl,
                title: title,
                desc: desc
            });
        } catch (error) {
            console.error('Error generating banner:', error);
        }
    };

    const handleDownload = () => {
        if (bannerData && bannerData.imageUrl) {
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
                <h2>{bannerData.title}</h2>
                <p style={{ display: bannerData.desc ? 'block' : 'none' }} dangerouslySetInnerHTML={{ __html: bannerData.desc }} />
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
