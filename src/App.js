import React, { useState } from 'react';
import BannerForm from './BannerForm';
import EventForm from './EventForm';
import EventForm2 from './EventForm2';
import { generateBanner } from './GenerateBanner';
import './App.css';

const App = () => {
    const [bannerData, setBannerData] = useState(null);
    const [formType, setFormType] = useState(null);

    const handleGenerate = async (data) => {
        try {
            const { jpgDataUrl, title, desc, svgContent } = await generateBanner(data);
            setBannerData({
                ...data,
                imageUrl: jpgDataUrl,
                svgContent,
                title,
                desc
            });
        } catch (error) {
            console.error('Error generating banner:', error);
        }
    };

    const handleDownload = () => {
        if (bannerData?.imageUrl) {
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
                <>
                    {!formType ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                            <div className="form-selection">
                                <button className="button" onClick={() => setFormType("exam")}>Exam Banner</button>
                                <button className="button" onClick={() => setFormType("event")}>Event Banner</button>
                                <button className="button" onClick={() => setFormType("event2")}>Event Banner 2</button>
                            </div>
                        </div>
                    ) : formType === "exam" ? (
                        <BannerForm onGenerate={handleGenerate} />
                    ) : formType === "event" ? (
                            <EventForm onGenerate={handleGenerate} />
                        ) :
                        <EventForm2 onGenerate={handleGenerate} />
                    }
                </>
            ) : (
                <div className='output-container'>
                    <h2>{bannerData.title.replace(/_/g, ' ')}</h2>

                    {/* SVG Preview with correct Roboto font */}
                    <div
                        className="svg-preview"
                        dangerouslySetInnerHTML={{ __html: bannerData.svgContent }}
                        style={{ fontFamily: "'Roboto', sans-serif" }}
                    />

                    {/* JPG rasterized output */}
                    <img src={bannerData.imageUrl} alt="Generated Banner" className="banner-image" />

                    <p style={{ textAlign: 'left', marginBottom: '6px', marginTop: '10px', fontWeight: 'bold' }}>
                        Optional Description:
                    </p>
                    <p style={{ whiteSpace: "pre-line", textAlign: 'left', color: '#ccc', fontSize: '11pt' }}>
                        {bannerData.desc}
                    </p>

                    <div>
                        <button className="new-banner-button" onClick={() => { setBannerData(null); setFormType(null); }}>Back</button>
                        <button className="button" onClick={handleDownload}>Download Banner</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
