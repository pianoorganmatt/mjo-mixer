import React, { useState } from 'react';

const Fader = ({ label, min = 0, max = 1, step = 0.01, defaultValue = 0.5, onChange }) => {
    const [value, setValue] = useState(defaultValue);

    const handleChange = (e) => {
        const newValue = parseFloat(e.target.value);
        setValue(newValue);
        onChange(newValue);
    };

    return (
        <div className="fader-container">
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
                className="fader-slider"
            />
            {/* <label>{label}</label> */}
        </div>
    );
};

export default Fader;

