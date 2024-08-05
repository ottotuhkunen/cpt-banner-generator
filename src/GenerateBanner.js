import { format, parse } from 'date-fns';

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

// Format date for description
const getOrdinalSuffix = (day) => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
};

const formatDateWithSuffix = (inputDate) => {
    const parsedDate = parse(inputDate, 'dd MMM yyyy', new Date());
    const day = format(parsedDate, 'd');
    const month = format(parsedDate, 'MMMM');
    const year = format(parsedDate, 'yyyy');
    const suffix = getOrdinalSuffix(day);
    return `${day}${suffix} of ${month} ${year}`;
};

// Generate SVG content
export const generateBanner = async ({ country, callsign, icao, logon, type, date, startTime, endTime, candidate, place }) => {

    // Load SVG based on ICAO (main airports) or Country
    let svgFile = `${icao}.svg`;
    if (!['EFHK', 'ESSA', 'EKCH', 'ENGM', 'BIKF'].includes(icao)) {
        svgFile = `${country}.svg`;
    }

    const time = `${startTime} - ${endTime} UTC`;
    const formattedDate = formatDateWithSuffix(date);

    // make sure Candidate name starts with capital letter
    candidate = candidate.charAt(0).toUpperCase() + candidate.slice(1);

    const title = `${logon} | ${type}`;
    let desc = '';
    if (icao.startsWith('EF')) {
        let chartsLink = `https://aip.intor.fi/ad/${icao.toLowerCase()}.html`;
        let pilotBriefingLink = 'https://wiki.vatsim-scandinavia.org/books/finnish-airports-charts';

        if (icao.startsWith('EFIN')) {
            chartsLink = 'https://aip.intor.fi/fi/';
            desc = `
            Hi everyone!<br><br>
            We warmly welcome you to ${place} on the ${formattedDate} at ${startTime} UTC. ${candidate} is delighted to provide air traffic services for your flight in order to achieve the new ATC rating. 
            The checkout will cover multiple airports throughout the country.<br><br>
            <a href="https://aip.intor.fi/fi/" target="_blank">Finland Charts</a> | <a href="${pilotBriefingLink}" target="_blank">Pilot Briefing</a><br><br>
            If you wish to participate as a controller, please book your position in Discord #finnish-staffing.
            `;
        } else {
            desc = `
            Hi everyone!<br><br>
            We warmly welcome you to ${place} on the ${formattedDate} at ${startTime} UTC. ${candidate} is delighted to provide air traffic services for your flight in order to achieve the new ATC rating.<br><br>
            <a href="${chartsLink}" target="_blank">${icao} Charts</a> | <a href="${pilotBriefingLink}" target="_blank">Pilot Briefing</a><br><br>
            If you wish to participate as a controller, please book your position in Discord #finnish-staffing.
            `;
        }
    }

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

        return { pngDataUrl, title, desc };
    } catch (error) {
        console.error('Failed to convert SVG to PNG:', error);
        return null;
    } finally {
        // Clean up
        URL.revokeObjectURL(svgUrl);
    }
};
