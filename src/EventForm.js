import React, { useState, useRef, useEffect } from "react";
import eventSvg from "./eventType1.svg";
import "./App.css";
import { TextField, Slider, Button, IconButton, Box, Typography, Stack, Chip } from "@mui/material";
import { ArrowUpward, ArrowDownward, ArrowBack, ArrowForward, ZoomIn, ZoomOut } from "@mui/icons-material";
import './BannerForm.css';

const EventForm = ({ onBack }) => {
  const [eventName, setEventName] = useState("Title");
  const [subtitle, setSubtitle] = useState("Optional Subtitle");
  const [eventDate, setEventDate] = useState("10 Oct 2025");
  const [eventTime, setEventTime] = useState("17:00 - 20:00 UTC");
  const [location1, setLocation1] = useState("ESSA - Stockholm Arlanda");
  const [location2, setLocation2] = useState("Optional 2nd location");
  const [location3, setLocation3] = useState("Optional 3rd location");

  const [uploadedImage, setUploadedImage] = useState(null);
  const [opacity, setOpacity] = useState(0.78);

  const [imgX, setImgX] = useState(0);
  const [imgY, setImgY] = useState(0);
  const [imgScale, setImgScale] = useState(1);

  const svgContainerRef = useRef(null);

  useEffect(() => {
    fetch(eventSvg)
      .then((res) => res.text())
      .then((text) => {
        if (!svgContainerRef.current) return;
        svgContainerRef.current.innerHTML = text;
  
        // Immediately update SVG with current state
        const svg = svgContainerRef.current.querySelector("svg");
        if (!svg) return;

          const styleNode = document.createElement("style");
          styleNode.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        text {
          font-family: 'Roboto', sans-serif !important;
        }
      `;
          svg.insertBefore(styleNode, svg.firstChild);
  
        const updateSVG = () => {
          // EVENT_TITLE
          const nameNode = svg.querySelector("#EVENT_TITLE");
          if (nameNode) {
            nameNode.textContent = eventName || "Event Name";
            nameNode.setAttribute("y", subtitle ? "0" : "94");
          }
  
          // SUBTITLE
          const subtitleNode = svg.querySelector("#SUBTITLE");
          if (subtitleNode) {
            subtitleNode.textContent = subtitle || "";
            subtitleNode.style.display = subtitle ? "block" : "none";
          }
  
          // DATE & TIME
          const dateNode = svg.querySelector("#DATE");
          if (dateNode) dateNode.textContent = eventDate || "Event Date";
          const timeNode = svg.querySelector("#TIME");
          if (timeNode) timeNode.textContent = eventTime || "Event Time";
  
          // TimeContainer
          if (dateNode) {
            const bbox = dateNode.getBBox();
            const spacing = 280;
            const timeContainer = svg.querySelector("#TimeContainer");
            if (timeContainer) {
              timeContainer.removeAttribute("transform");
              const containerBox = timeContainer.getBBox();
              const newX = bbox.x + bbox.width + spacing;
              const dx = newX - containerBox.x;
              timeContainer.setAttribute("transform", `translate(${dx},0)`);
            }
          }
  
          // Locations
          const loc1Node = svg.querySelector("#LOCATION_1");
          if (loc1Node) loc1Node.textContent = location1 || "";
          const loc2Node = svg.querySelector("#LOCATION_2");
          if (loc2Node) {
            if (location2) {
              loc2Node.textContent = location2;
              loc2Node.style.display = "block";
              svg.querySelector("#LOCATION_2-2").style.display = "block";
            } else {
              loc2Node.style.display = "none";
              svg.querySelector("#LOCATION_2-2").style.display = "none";
            }
          }
            const loc3Node = svg.querySelector("#LOCATION_3");
            if (loc3Node) {
                if (location3) {
                    loc3Node.textContent = location3;
                    loc3Node.style.display = "block";
                    svg.querySelector("#LOCATION_3-2").style.display = "block";
                } else {
                    loc3Node.style.display = "none";
                    svg.querySelector("#LOCATION_3-2").style.display = "none";
                }
            }
  
          // Overlay
          const overlayNode = svg.querySelector("#OVERLAY");
          if (overlayNode) overlayNode.style.opacity = opacity;
  
          // Uploaded image
          const imageNode = svg.querySelector("#REPLACE_ME");
          if (imageNode && uploadedImage) {
            imageNode.setAttributeNS("http://www.w3.org/1999/xlink", "href", uploadedImage);
            imageNode.setAttribute("transform", `translate(${imgX}, ${imgY}) scale(${imgScale})`);
            imageNode.setAttribute("preserveAspectRatio", "xMidYMid meet");
          }
        };
  
        updateSVG();
      });
  }, []);  

  useEffect(() => {
    if (!svgContainerRef.current) return;
    const svg = svgContainerRef.current.querySelector("svg");
    if (!svg) return;

    const nameNode = svg.querySelector("#EVENT_TITLE");
    if (nameNode) {
      nameNode.textContent = eventName || "Event Name";
      if (!subtitle) {
        nameNode.setAttribute("y", "94");
      } else {
        nameNode.setAttribute("y", "0");
      }
    }

    const subtitleNode = svg.querySelector("#SUBTITLE");
    if (subtitleNode) {
      subtitleNode.textContent = subtitle || "";
      subtitleNode.style.display = subtitle ? "block" : "none";
    }

    const dateNode = svg.querySelector("#DATE");
    if (dateNode) dateNode.textContent = eventDate || "Event Date";

    const timeNode = svg.querySelector("#TIME");
    if (timeNode) timeNode.textContent = eventTime || "Event Time";

    if (dateNode) {
      const bbox = dateNode.getBBox();
      const spacing = 280;
      const timeContainer = svg.querySelector("#TimeContainer");
      if (timeContainer) {
        timeContainer.removeAttribute("transform");
        const containerBox = timeContainer.getBBox();
        const newX = bbox.x + bbox.width + spacing;
        const dx = newX - containerBox.x;
        timeContainer.setAttribute("transform", `translate(${dx},0)`);
      }
    }

    const loc1Node = svg.querySelector("#LOCATION_1");
    if (loc1Node) loc1Node.textContent = location1 || "";

    const loc2Node = svg.querySelector("#LOCATION_2");
    if (loc2Node) {
      if (location2) {
        loc2Node.textContent = location2;
        loc2Node.style.display = "block";
        svg.querySelector("#LOCATION_2-2").style.display = "block";
      } else {
        loc2Node.style.display = "none";
        svg.querySelector("#LOCATION_2-2").style.display = "none";
      }
    }
      const loc3Node = svg.querySelector("#LOCATION_3");
      if (loc3Node) {
          if (location3) {
              loc3Node.textContent = location3;
              loc3Node.style.display = "block";
              svg.querySelector("#LOCATION_3-2").style.display = "block";
          } else {
              loc3Node.style.display = "none";
              svg.querySelector("#LOCATION_3-2").style.display = "none";
          }
      }

    const overlayNode = svg.querySelector("#OVERLAY");
    if (overlayNode) {
      overlayNode.style.opacity = opacity;
    }
  }, [eventName, subtitle, eventTime, eventDate, location1, location2, location3, opacity]);

  useEffect(() => {
    if (!svgContainerRef.current) return;
    const svg = svgContainerRef.current.querySelector("svg");
    if (!svg) return;

    const imageNode = svg.querySelector("#REPLACE_ME");
    if (!imageNode) return;

    if (uploadedImage) {
      imageNode.setAttributeNS("http://www.w3.org/1999/xlink", "href", uploadedImage);
      imageNode.setAttribute("transform", `translate(${imgX}, ${imgY}) scale(${imgScale})`);
      imageNode.setAttribute("preserveAspectRatio", "xMidYMid meet");
    }
  }, [uploadedImage, imgX, imgY, imgScale]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      const reader = new FileReader();
      reader.onload = () => setUploadedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    const svg = svgContainerRef.current.querySelector("svg");
    if (!svg) return;
  
    // Serialize SVG
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
  
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1920; // Desired width
      canvas.height = 1080; // Desired height
      const ctx = canvas.getContext("2d");
  
      // Scale image to fit canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
      const jpgData = canvas.toDataURL("image/jpeg", 1);
      const link = document.createElement("a");
      link.href = jpgData;
      link.download = eventName + ".jpg";
      link.click();
  
      URL.revokeObjectURL(url);
    };
  
    img.src = url;
  };

  const holdAction = (action) => {
    let intervalId;
  
    const onMouseDown = () => {
      action(); // run once immediately
      intervalId = setInterval(action, 100); // repeat every 100ms
  
      // Stop when mouse is released anywhere
      const stop = () => {
        clearInterval(intervalId);
        document.removeEventListener("mouseup", stop);
        document.removeEventListener("mouseleave", stop);
      };
  
      document.addEventListener("mouseup", stop);
      document.addEventListener("mouseleave", stop);
    };
  
    return {
      onMouseDown,
    };
  };

  return (
    <Box className="event-banner-container">
      {/* SVG Preview */}
      <div ref={svgContainerRef} style={{ width: "100%", height: "auto", marginBottom: "10px" }}></div>

      {/* Image controls */}
      {uploadedImage && (
        <Box>
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Chip label="Image Placement" sx={{ backgroundColor: "#585858", color: "#fff", fontWeight: 500 }}/>
            <IconButton size="small" {...holdAction(() => setImgY((y) => y - 10))} sx={{ backgroundColor: "#585858", "&:hover": { backgroundColor: "#696969" }}}>
            <ArrowUpward sx={{ color: "#fff" }}/>
            </IconButton>
            <IconButton size="small" {...holdAction(() => setImgY((y) => y + 10))} sx={{ backgroundColor: "#585858", "&:hover": { backgroundColor: "#696969" }}}>
            <ArrowDownward sx={{ color: "#fff" }}/>
            </IconButton>
            <IconButton size="small" {...holdAction(() => setImgX((x) => x - 10))} sx={{ backgroundColor: "#585858", "&:hover": { backgroundColor: "#696969" }}}>
            <ArrowBack sx={{ color: "#fff" }}/>
            </IconButton>
            <IconButton size="small" {...holdAction(() => setImgX((x) => x + 10))} sx={{ backgroundColor: "#585858", "&:hover": { backgroundColor: "#696969" }}}>
            <ArrowForward sx={{ color: "#fff" }}/>
            </IconButton>
            <IconButton size="small" {...holdAction(() => setImgScale((scale) => scale * 1.01))} sx={{ backgroundColor: "#585858", "&:hover": { backgroundColor: "#696969" }}}>
            <ZoomIn sx={{ color: "#fff" }}/>
            </IconButton>
            <IconButton size="small" {...holdAction(() => setImgScale((scale) => scale / 1.01))} sx={{ backgroundColor: "#585858", "&:hover": { backgroundColor: "#696969" }}}>
            <ZoomOut sx={{ color: "#fff" }}/>
            </IconButton>
        </Stack>
        </Box>
      )}

      {/* Inputs */}
      <Stack spacing={2} alignItems="center" sx={{ width: "100%" }}>
        {/* Title + Subtitle Row */}
        <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
          <TextField
            fullWidth
            size="small"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            sx={{ backgroundColor: "#fff" }}
          />
          <TextField
            fullWidth
            size="small"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            sx={{ backgroundColor: "#fff" }}
          />
        </Stack>

        {/* Date + Time Row */}
        <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
          <TextField
            fullWidth
            size="small"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            sx={{ backgroundColor: "#fff" }}
          />
          <TextField
            fullWidth
            size="small"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            sx={{ backgroundColor: "#fff" }}
          />
        </Stack>

        {/* Location Row */}
        <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
          <TextField
            fullWidth
            size="small"
            value={location1}
            onChange={(e) => setLocation1(e.target.value)}
            sx={{ backgroundColor: "#fff" }}
          />
          <TextField
            fullWidth
            size="small"
            value={location2}
            onChange={(e) => setLocation2(e.target.value)}
            sx={{ backgroundColor: "#fff" }}
          />
            <TextField
                fullWidth
                size="small"
                value={location3}
                onChange={(e) => setLocation3(e.target.value)}
                sx={{ backgroundColor: "#fff" }}
            />
        </Stack>

        {/* Upload Image */}
        <Button variant="contained" component="label" sx={{ mt: 1, borderRadius: 0, textTransform: "none" }}>
          Upload Image
          <input type="file" hidden accept="image/png,image/jpeg" onChange={handleImageUpload} />
        </Button>

        {/* Overlay Opacity */}
        <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
            <Chip label="Overlay Opacity" sx={{ backgroundColor: "#585858", color: "#fff", fontWeight: 500 }}/>
            <Slider min={0.4} max={0.95} step={0.01} value={opacity} onChange={(e, val) => setOpacity(val)} sx={{ color: "#b0b0b0", '& .MuiSlider-thumb': { backgroundColor: "#fff" }, '& .MuiSlider-track': { backgroundColor: "#a0a0a0" }, '& .MuiSlider-rail': { color: "#808080" } }}/>
        </Stack>          

        {/* Download Button */}
        <Box sx={{ mt: 3 }}>

            <button className="new-banner-button" onClick={() => window.location.reload()}>
                Back
            </button>
            <button className="button" onClick={handleDownload}>Download Banner</button>
        </Box>
      </Stack>
    </Box>
  );
};

export default EventForm;
