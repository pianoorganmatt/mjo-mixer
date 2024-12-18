import React from 'react';

const AudioUploader = ({ onFilesSelected }) => {
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        onFilesSelected(files);
    };

    return (
        <div className="audio-uploader">
            <input
                type="file"
                accept="audio/*"
                multiple
                onChange={handleFileChange}
            />
        </div>
    );
};

export default AudioUploader;
