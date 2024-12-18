import React, { useEffect, useRef } from 'react';

const AudioPlayer = ({ audioContext, audioBuffer }) => {
    const sourceRef = useRef(null);

    const playAudio = () => {
        if (audioContext && audioBuffer) {
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start(0);
            sourceRef.current = source;
        }
    };

    const stopAudio = () => {
        if (sourceRef.current) {
            sourceRef.current.stop(0);
        }
    };

    useEffect(() => {
        return () => {
            stopAudio(); // Stop the audio when the component is unmounted
        };
    }, []);

    return (
        <div className="audio-player">
            <button onClick={playAudio}>Play</button>
            <button onClick={stopAudio}>Stop</button>
        </div>
    );
};

export default AudioPlayer;
