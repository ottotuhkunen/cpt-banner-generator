// fetch SVG from public directory
const fetchSVGContent = async (filename) => {
    const response = await fetch(`${process.env.PUBLIC_URL}/svgs/${filename}`);
    if (!response.ok) {
        throw new Error('Failed to fetch SVG content');
    }
    return response.text();
};

// fetch image content
const fetchImageContent = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch image content');
    }
    return response.blob();
};

// Generate SVG content
export const generateBanner = async ({ country, callsign, icao, type, date, time, candidate }) => {
    // console.log('Parameters:', { country, callsign, icao, type, date, time, candidate });

    // Load SVG based on ICAO (main airports) or Country
    let svgFile = `${icao}.svg`;
    if (!['EFHK', 'ESSA', 'EKCH', 'ENGM', 'BIKF'].includes(icao)) {
        svgFile = `${country}.svg`;
    }
    console.log('SVG file name:', svgFile);

    // Fetch and modify the SVG content
    const svgContent = await fetchSVGContent(svgFile);

    // Create a DOM element to inject the SVG
    const svgContainer = document.createElement('div');
    svgContainer.innerHTML = svgContent;

    // Modify the SVG content
    const svgElement = svgContainer.querySelector('svg');
    if (svgElement) {
        svgElement.querySelector('#callsign').textContent = callsign || 'Donlon Tower';
        svgElement.querySelector('#type').textContent = type || '';
        svgElement.querySelector('#date').textContent = date || '';
        svgElement.querySelector('#time').textContent = time || '';
        svgElement.querySelector('#candidate').textContent = candidate || 'Error';
        
        const icaoElement = svgElement.querySelector('#icao');

        if (icaoElement) {
            icaoElement.textContent = icao || 'ZZZZ';

            if (icao.length > 4) {
                icaoElement.setAttribute('style', `font-size: 46px;`);
            }  
        }

        const backgroundImages = svgElement.querySelectorAll('image');
        for (const img of backgroundImages) {
            const href = img.getAttribute('xlink:href');
            if (href) {
                try {
                    const imageBlob = await fetchImageContent(`${process.env.PUBLIC_URL}/backgrounds/${href}`);
                    const imageUrl = URL.createObjectURL(imageBlob);
                    img.setAttribute('xlink:href', imageUrl);
                } catch (error) {
                    console.error(`Failed to fetch image at ${href}:`, error);
                }
            }
        }
    } else {
        console.error('No SVG element found in the fetched content');
        return null;
    }

    // Serialize SVG to a string and create a Blob
    const svgBlob = new Blob([svgContainer.innerHTML], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    try {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // Create a temporary image element
        const image = new Image();
        image.src = svgUrl;

        // Wait for the image to load
        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
        });

        // Set canvas size based on SVG dimensions
        const viewBox = svgElement.getAttribute('viewBox');
        if (!viewBox) {
            console.error('No viewBox attribute found on SVG element');
            return null;
        }

        const [minX, minY, width, height] = viewBox.split(' ').map(Number);
        canvas.width = width;
        canvas.height = height;

        // Draw image on the canvas
        context.drawImage(image, 0, 0, width, height);

        // Convert canvas to PNG
        const pngDataUrl = canvas.toDataURL('image/png');

        return pngDataUrl;
    } catch (error) {
        console.error('Failed to convert SVG to PNG:', error);
        return null;
    } finally {
        // Clean up
        URL.revokeObjectURL(svgUrl);
    }
};
