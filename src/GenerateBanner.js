import { format } from "date-fns";

// Fetch SVG from public directory
const fetchSVGContent = async (filename) => {
    const response = await fetch(`${process.env.PUBLIC_URL}/svgs/new/${filename}`);
    if (!response.ok) {
        throw new Error("Failed to fetch SVG content");
    }
    return response.text();
};

function formatDateUTC(d) {
    const days = [
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];
    const months = [
        "January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"
    ];
    const day = d.getUTCDate();
    const suffix =
        [,"st","nd","rd"][day % 10] &&
        ![11, 12, 13].includes(day) ? [,"st","nd","rd"][day % 10] : "th";
    return `${days[d.getUTCDay()]}, ${months[d.getUTCMonth()]} ${day}${suffix}`;
}

function formatType(type) {
    const first = type.split(" ")[0];
    if (first === "Tier") return "Tier 1 endorsement";
    return `${first} rating`;
}

// Helper function: Embed font as base64 in SVG
async function embedFontCSS(fontName, fontUrl, fontWeight = "normal") {
    const response = await fetch(fontUrl);
    if (!response.ok) {
        console.error(`Failed to load font ${fontName} from ${fontUrl}`);
        return "";
    }
    const fontData = await response.arrayBuffer();
    const fontBase64 = btoa(
        new Uint8Array(fontData).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );
    return `
@font-face {
    font-family: '${fontName}';
    src: url(data:font/ttf;base64,${fontBase64}) format('truetype');
    font-weight: ${fontWeight};
    font-style: normal;
}
`;
}

export const generateBanner = async ({
                                         callsign,
                                         svgName,
                                         type,
                                         date,
                                         startTime,
                                         endTime,
                                         candidate,
                                         timestamp,
                                     }) => {
    const svgFile = `${svgName}.svg`;

    const time = `${startTime} - ${endTime} UTC`;
    candidate = candidate.charAt(0).toUpperCase() + candidate.slice(1);
    const title = `${type} | ${svgName}`;

    const desc = `Hi everyone!

We warmly welcome you to ${callsign.split(" ")[0]} on ${formatDateUTC(
        timestamp
    )}, at ${startTime}z! ${candidate} is delighted to provide air traffic services for your flight as he works toward his ${formatType(
        type
    )}. All traffic is welcome, and greatly appreciated.

* ${callsign}
* ${date} at ${startTime}z

[Pilot Briefing](url_here) ${
        svgName.startsWith("EF") ? " | [VFR Guide](url_here)" : ""
    }

${
        svgName.startsWith("EF")
            ? "If you wish to participate as a controller, please book your position in Discord [#finnish-staffing](url_here)!"
            : ""
    }`;

    const svgContent = await fetchSVGContent(svgFile);

    const svgContainer = document.createElement("div");
    svgContainer.innerHTML = svgContent;

    const svgElement = svgContainer.querySelector("svg");
    if (!svgElement) {
        console.error("No SVG element found in the fetched content");
        return null;
    }

    // Embed fonts with correct weights
    const robotoBoldCSS = await embedFontCSS(
        "Roboto",
        `${process.env.PUBLIC_URL}/fonts/Roboto-Bold.ttf`,
        "700"
    );
    const robotoMediumCSS = await embedFontCSS(
        "Roboto",
        `${process.env.PUBLIC_URL}/fonts/Roboto-Medium.ttf`,
        "500"
    );
    const robotoRegularCSS = await embedFontCSS(
        "Roboto",
        `${process.env.PUBLIC_URL}/fonts/Roboto-Regular.ttf`,
        "400"
    );

    const styleNode = document.createElement("style");
    styleNode.textContent = `
${robotoBoldCSS}
${robotoMediumCSS}
${robotoRegularCSS}
text {
    font-family: 'Roboto', sans-serif !important;
}
`;
    svgElement.insertBefore(styleNode, svgElement.firstChild);

    // Set proper font-weight on SVG text elements if SVG uses classes
    const weightMap = {
        ".cls-11": "700", // Bold
        ".cls-12": "500", // Medium
        ".cls-13": "500", // Medium
        ".cls-14": "400", // Regular
    };
    Object.entries(weightMap).forEach(([cls, weight]) => {
        svgElement.querySelectorAll(cls).forEach(el => {
            el.setAttribute("font-weight", weight);
            el.setAttribute("font-family", "Roboto");
        });
    });

    // Update text nodes inside SVG
    const updates = [
        { id: "#callsign", text: callsign },
        { id: "#type", text: type },
        { id: "#date", text: date },
        { id: "#time", text: time },
        { id: "#candidate", text: candidate },
    ];
    updates.forEach(({ id, text }) => {
        const el = svgElement.querySelector(id);
        if (el) el.textContent = text || "";
    });

    const finalSVGString = new XMLSerializer().serializeToString(svgElement);

    const svgBlob = new Blob([finalSVGString], {
        type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        const image = new Image();
        image.src = svgUrl;

        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
        });

        const viewBox = svgElement.getAttribute("viewBox");
        if (!viewBox) {
            console.error("No viewBox attribute found on SVG element");
            return null;
        }

        const [minX, minY, width, height] = viewBox.split(" ").map(Number);
        canvas.width = width;
        canvas.height = height;

        context.fillStyle = "#0c2442";
        context.fillRect(0, 0, width, height);

        context.drawImage(image, 0, 0, width, height);

        const jpgDataUrl = canvas.toDataURL("image/jpeg", 1.0);

        return {
            jpgDataUrl,
            title,
            desc,
            svgContent: finalSVGString,
        };
    } catch (error) {
        console.error("Failed to convert SVG to JPG:", error);
        return null;
    } finally {
        URL.revokeObjectURL(svgUrl);
    }
};
