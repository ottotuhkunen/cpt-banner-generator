import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import TimePicker from 'react-time-picker';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-time-picker/dist/TimePicker.css';
import './BannerForm.css';
import { generateBanner } from './GenerateBanner';
import callSignsData from './data.json'; // Import JSON data (ATS-units)

const types = [
    { value: 'ATC Exam', label: 'Exam (CPT)' },
    { value: 'ATC Validation', label: 'Validation (T1)' },
];

const BannerForm = ({ onGenerate }) => {
    const [callsignOptions, setCallsignOptions] = useState([]);
    const [callsign, setCallsign] = useState(null);
    const [type, setType] = useState(null);
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState('17:00');
    const [endTime, setEndTime] = useState('19:00');
    const [candidate, setCandidate] = useState('');
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // Convert JSON data
        const formattedOptions = callSignsData.map(sign => ({
            value: sign.value,
            label: `${sign.value} - ${sign.name}`,
            ...sign,
        }));
        setCallsignOptions(formattedOptions);
    }, []);

    const handleGenerate = () => {
        setSubmitted(true);
        if (callsign && type && date && startTime && endTime && candidate) {
            const formattedDate = date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            onGenerate({ 
                country: callsign.country,
                callsign: callsign.name,
                icao: callsign.icao, 
                type: type.value, 
                date: formattedDate,
                time: `${startTime} - ${endTime} UTC`,
                candidate: candidate
            });
        }
    };

    const getSelectStyles = (field) => ({
        control: (provided) => ({
            ...provided,
            borderColor: submitted && !field ? '#b63f3f' : provided.borderColor,
        }),
    });

    return (
        <div className="banner-form">

            <label>Call Sign</label>

            <Select 
                options={callsignOptions} 
                onChange={setCallsign} 
                placeholder="Call sign" 
                classNamePrefix="react-select"
                styles={getSelectStyles(callsign)}
            />
            
            <label>Event Type</label>

            <Select 
                options={types} 
                onChange={setType} 
                placeholder="Type" 
                classNamePrefix="react-select"
                styles={getSelectStyles(type)}
            />

            <label>Date</label>

            <DatePicker 
                selected={date} 
                onChange={setDate} 
                dateFormat="dd MMM yyyy"
                startDate={0}
            />

            <label>Start- and End Time (UTC)</label>

            <div className="time-container">
                <TimePicker 
                    onChange={setStartTime} 
                    value={startTime} 
                    disableClock={true}
                    clearIcon={null} 
                    format="HH:mm"
                />
                <span className="time-separator">-</span>
                <TimePicker 
                    onChange={setEndTime} 
                    value={endTime} 
                    disableClock={true}
                    clearIcon={null}
                    format="HH:mm"
                />
            </div>

            <label>Candidate</label>

            <input 
                type="text" 
                value={candidate} 
                onChange={(e) => setCandidate(e.target.value)} 
                placeholder="First Name"
                className={`candidate-input ${submitted && !candidate ? 'input-error' : ''}`}
            />

            <button onClick={handleGenerate}>Generate Banner</button>
        </div>
    );
};

export default BannerForm;
