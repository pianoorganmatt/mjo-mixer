import React, { useState } from 'react';

const RotaryKnob = ({ label, onChange }) => {
    const [degree, setDegree] = useState(180);

    const handleMouseDown = (e) => {
        const startY = e.pageY;
        const startDegree = degree;

        const handleMouseMove = (moveEvent) => {
            const moveY = moveEvent.pageY - startY;
            const newDegree = Math.min(Math.max(startDegree - moveY, 50), 310);
            setDegree(newDegree);
            onChange(newDegree);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div className="dial-container">
            <div className="notches"></div>
            <div
                className="dial"
                style={{ transform: `rotate(${degree}deg)` }}
                onMouseDown={handleMouseDown}
            >
                <div className="dial-inner"></div>
            </div>
            <p>{label}</p>
        </div>
    );
};

export default RotaryKnob;
