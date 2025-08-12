import { format, parse } from 'date-fns';

// fetch SVG from public directory
const fetchSVGContent = async (filename) => {
    const response = await fetch(`${process.env.PUBLIC_URL}/svgs/new/${filename}`);
    if (!response.ok) {
        throw new Error('Failed to fetch SVG content');
    }
    return response.text();
};

// Generate SVG content
export const generateBanner = async ({ callsign, svgName, type, date, startTime, endTime, candidate }) => {

    // Load SVG based on svgName
    let svgFile = `${svgName}.svg`;

    const time = `${startTime} - ${endTime} UTC`;
    // make sure Candidate name starts with capital letter
    candidate = candidate.charAt(0).toUpperCase() + candidate.slice(1);

    const title = `${svgName} | ${type}`;

    // Fetch and modify the SVG content
    const svgContent = await fetchSVGContent(svgFile);

    // Create a DOM element to inject the SVG
    const svgContainer = document.createElement('div');
    svgContainer.innerHTML = svgContent;

    // Modify the SVG content
    const svgElement = svgContainer.querySelector('svg');
    if (svgElement) {
        svgElement.querySelector('#callsign').textContent = callsign || 'Error';
        svgElement.querySelector('#type').textContent = type || '';
        svgElement.querySelector('#date').textContent = date || '';
        svgElement.querySelector('#time').textContent = time || '';
        svgElement.querySelector('#candidate').textContent = candidate || 'Error';
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
        context.fillStyle = "#0c2442";
        context.fillRect(0, 0, width, height);
        
        // Draw SVG image on top
        context.drawImage(image, 0, 0, width, height);
        const jpgDataUrl = canvas.toDataURL('image/jpeg', 1.0);
        
        return { jpgDataUrl, title };
    } catch (error) {
        console.error('Failed to convert SVG to PNG:', error);
        return null;
    } finally {
        // Clean up
        URL.revokeObjectURL(svgUrl);
    }
};
