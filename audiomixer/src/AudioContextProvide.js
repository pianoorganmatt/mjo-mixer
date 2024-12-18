import React, { createContext, useContext, useEffect, useState } from 'react';

const AudioContext = createContext();

export const useAudioContext = () => {
    return useContext(AudioContext);
};

export const AudioContextProvider = ({ children }) => {
    const [audioCtx, setAudioCtx] = useState(null);

    useEffect(() => {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        setAudioCtx(context);
    }, []);

    return (
        <AudioContext.Provider value={audioCtx}>
            {children}
        </AudioContext.Provider>
    );
};
