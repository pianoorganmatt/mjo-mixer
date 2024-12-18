
import React, { useState, useEffect, useRef } from 'react';
import { GiSettingsKnobs } from "react-icons/gi";
import { FaPlay } from "react-icons/fa";
import { GiPauseButton } from "react-icons/gi";
import Mixer from './Mixer';


const Main = ({ audioContext, files ,title}) => {
    const [tracks, setTracks] = useState([]);
    const [soloedTrackIndex, setSoloedTrackIndex] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const visualizerRefs = useRef([]);
    const [loading , setLoading] =  useState(false);
    const [currentPositions, setCurrentPositions] = useState([]);
    const [ endedTracksCount, setEndedTracksCount] = useState();
    const [progress, setProgress] = useState(0);
    const [maxTrackDuration, setMaxTrackDuration] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);


    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);


    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${hrs > 0 ? hrs.toString().padStart(2, '0') + ':' : ''}${mins.toString().padStart(2, '0')}:${secs}`;
    };

    const urlToFile = (url, fileName) => {
        setLoading(true)
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'blob'; // Ensure we receive a Blob response
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    // Log response headers
                    // Log response body (as text if possible)
                    xhr.response.text().then(text => {
                    }).catch(error => {
                        console.error('Error converting response to text:', error);
                    });

                    // Create a Blob from the response
                    const blob = xhr.response;

                    // Create a File from the Blob
                    const file = new File([blob], fileName, { type: blob.type });
                    resolve(file);
                    setLoading(false)
                } else {
                    reject(new Error('Network response was not ok: ' + xhr.statusText));
                    setLoading(false)
                }
            };

            xhr.onerror = () => {
                reject(new Error('Network error occurred'));
                setLoading(false)
            };

            xhr.send();
        });
    };
  
    useEffect(() => {
        const setupTracks = async () => {
            const loadedTracks = await Promise.all(
                files.map(async (file, index) => {
                    const filee = await urlToFile(file.track_file, `$tracks${index}`);
                    const arrayBuffer = await filee.arrayBuffer();
                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                    setMaxTrackDuration((prevMax) => Math.max(prevMax, audioBuffer.duration));
                    const gainNode = audioContext.createGain();
                    const bassEQ = audioContext.createBiquadFilter();
                    bassEQ.type = 'lowshelf';
                    bassEQ.frequency.setValueAtTime(500, audioContext.currentTime);
                    const midEQ = audioContext.createBiquadFilter();
                    midEQ.type = 'peaking';
                    midEQ.Q.setValueAtTime(Math.SQRT1_2, audioContext.currentTime);
                    midEQ.frequency.setValueAtTime(1500, audioContext.currentTime);
                    const trebleEQ = audioContext.createBiquadFilter();
                    trebleEQ.type = 'highshelf';
                    trebleEQ.frequency.setValueAtTime(3000, audioContext.currentTime);
                    const pannerNode = audioContext.createStereoPanner();
                    const analyserNode = audioContext.createAnalyser();
                    analyserNode.fftSize = 2048; // Higher fftSize gives a smoother waveform
                    return {
                        buffer: audioBuffer,
                        gainNode,
                        bassEQ,
                        midEQ,
                        trebleEQ,
                        pannerNode,
                        analyserNode,
                        sourceNode: null,
                        muted: false,
                        soloed: false,
                        volume: 1, // Default volume is 1
                        currentTime: 0,
                        hasStarted: false,
                        startTime: 0,
                    };
                })
            );
            setTracks(loadedTracks);
        };
        

        setupTracks();
    }, [audioContext, files]);

    const playAllTracks = (position) => {
        const newTracks = tracks.map((track, index) => {
            const sourceNode = audioContext.createBufferSource();
            sourceNode.buffer = track.buffer;
            sourceNode.connect(track.bassEQ)
                .connect(track.midEQ)
                .connect(track.trebleEQ)
                .connect(track.gainNode)
                .connect(track.pannerNode)
                .connect(track.analyserNode)
                .connect(audioContext.destination);
            sourceNode.loop = true;
    
            const isTrackSoloed = tracks.some(t => t.soloed);
    
            // If any track is soloed, only the soloed track(s) should play
            if (isTrackSoloed) {
                track.gainNode.gain.value = track.soloed && !track.muted ? track.volume : 0;
            } else {
                // If no track is soloed, respect the mute state for all tracks
                track.gainNode.gain.value = track.muted ? 0 : track.volume;
            }
            const offset = position || 0; // Start from pausedAt if track was paused
            sourceNode.start(0, offset);
            track.sourceNode = sourceNode;
    
            track.hasStarted = true;
            track.startTime = audioContext.currentTime - offset; // Adjust start time to handle resuming
            track.manuallyStopped = false;
    
            // drawWaveform(track, index);
            return { ...track, sourceNode };
        });
        setTracks(newTracks);
        setIsPlaying(true);
        
        
    };

    useEffect(() => {
        visualizerRefs.current = files.map((_, i) => visualizerRefs.current[i] || React.createRef());
    }, [files]);
    
    
  
    const stopAllTracks = () => {
        const updatedTracks = tracks.map((track) => {
            if (track.sourceNode && track.hasStarted) {
                try {
                    const elapsedTime = audioContext.currentTime - track.startTime;
                    track.pausedAt = elapsedTime; // Store the paused time
                    track.sourceNode.stop(0);
                } catch (e) {
                    console.error('Error stopping track:', e);
                }
                // Mark the track as stopped but preserve its soloed and muted states
                return {
                    ...track,
                    sourceNode: null, // Ensure sourceNode is reset so a new one is created next time
                    hasStarted: false, // Track has stopped, but retain other properties like soloed/muted
                };
            }
            return track;
        });
        setIsPlaying(false);
        setTracks(updatedTracks); // Update the state with the updated tracks
    };
    const adjustVolume = (index, value) => {
        const newTracks = [...tracks];
        newTracks[index].volume = value;  // Store the adjusted volume in the state
    
        // Only update the gain node if the track is not muted
        if (!newTracks[index].muted) {
            newTracks[index].gainNode.gain.value = value;
        }
    
        setTracks(newTracks);
    };
    const toggleMute = (index) => {
        const newTracks = [...tracks];
        
        // Toggle the muted state
        newTracks[index].muted = !newTracks[index].muted;
        
        // If the track is playing, update the gain value based on the muted state
        if (newTracks[index].hasStarted) {
            if (newTracks[index].muted) {
                // If the track is muted, set gain value to 0
                newTracks[index].gainNode.gain.value = 0;
            } else {
                // If the track is unmuted, restore the previous volume (instead of resetting to 1)
                newTracks[index].gainNode.gain.value = newTracks[index].volume;
            }
        }
        
        setTracks(newTracks);
    };

    const toggleSolo = (index) => {
        const newTracks = tracks;
    
        // Toggle solo status for the selected track
        newTracks[index].soloed = !newTracks[index].soloed;
    
        const anySoloed = newTracks.some(track => track.soloed);
    
        // If any tracks are soloed, mute non-soloed tracks, otherwise unmute all
        newTracks.forEach((track) => {
            if (anySoloed) {
                // If the track is soloed and NOT muted, set the gain to its volume, else keep it muted
                if (track.soloed) {
                    track.gainNode.gain.value = track.muted ? 0 : track.volume; // Use the track's volume
                } else {
                    // Mute non-soloed tracks
                    track.gainNode.gain.value = 0;
                }
            } else {
                // If no tracks are soloed, revert to the mute status and set the gain to the track's volume
                track.gainNode.gain.value = track.muted ? 0 : track.volume;  // Use the track's volume
            }
        });
    
        setTracks(newTracks); // Update the state with the new tracks
    };
    
    const handleProgressChange = (event) => {
        const newTime = (event.target.value / 100) * maxTrackDuration;
        setProgress(event.target.value);
        stopAllTracks();
        setCurrentTime(newTime);
        playAllTracks(newTime);
    };


    useEffect(() => {
        let animationFrameId;

        const updateProgress = () => {
            if (isPlaying) {
                let currentTime = Math.max(
                    ...tracks.map(track => audioContext.currentTime - track.startTime)
                );

                // Check if the tracks have looped
                if (currentTime >= maxTrackDuration) {
                    currentTime = 0; // Reset current time to 0 on loop
                    setTracks(tracks.map(track => ({ ...track, startTime: audioContext.currentTime }))); // Reset start times
                }

                setCurrentTime(currentTime);

                setProgress((currentTime / maxTrackDuration) * 100);
                animationFrameId = requestAnimationFrame(updateProgress);
            }
        };

        updateProgress();
        return () => cancelAnimationFrame(animationFrameId);
    }, [isPlaying, maxTrackDuration, tracks]);


    console.log("isModalOpen" , isModalOpen)
      
    return (
        <>
            <div className="app">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        <div className='audio--mix--player'>
                            <ul>
                                <li>
                                    {isPlaying 
                                        ?
                                            (
                                                <div className='mix--track' onClick={stopAllTracks}>
                                                    <span className='playy--mix'><GiPauseButton /></span>
                                                    <h3>{title || ''}<small>Music</small></h3>
                                                </div>
                                            )
                                        :   (
                                                <div className='mix--track' onClick={() => playAllTracks((progress / 100) * maxTrackDuration)}>
                                                    <span className='playy--mix'><  FaPlay/></span>
                                                    <h3>{title || ''}<small>Music</small></h3>
                                                </div>
                                            )
                                    }
                                </li>
                                <li className='ml--auto'>
                                        <span>{formatTime(currentTime)}</span>
                                        <span className=''>/</span>
                                        <span>{formatTime(maxTrackDuration)}</span>
                                </li>
                                <li>
                                    <button onClick={()=>setIsModalOpen(true)}><img src='https://flowers.cherkasov.dev/wp-content/uploads/2024/11/mixer.png' alt='Setting' /></button>
                                </li>
                            </ul>
                            <div className='sneak--bar'>
                                <div class="range">  
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={progress}
                                        onChange={handleProgressChange}
                                        style={{background: `linear-gradient(to right, #ffffff ${progress}%, #ffffff80 ${progress}%)`}}
                                    />
                                </div>
                            </div>
                        </div>
                        {(isModalOpen)&&
                            <div className='mixer--modal mixer--modal--show'>
                                <div className='modal--content'>
                                    <div className='modal---header'>
                                        <h2>Audio Mixer</h2>
                                        <button className='modal--close' onClick={()=>setIsModalOpen(false)}>&times;</button>
                                    </div>
                                    <div className='modal--body'>
                                        <Mixer
                                            tracks={tracks}
                                            isPlaying={isPlaying}
                                            toggleMute={toggleMute}
                                            toggleSolo={toggleSolo}
                                            adjustVolume={adjustVolume}
                                            visualizerRefs={visualizerRefs}
                                            files={files}
                                            stopAllTracks={stopAllTracks}      // Pass stopAllTracks function
                                            playAllTracks={playAllTracks}
                                            progress = {progress}
                                            maxTrackDuration={maxTrackDuration}
                                        />
                                    </div>
                                </div>
                            </div>
                        }
                    </>
                )}
            </div>
        </>
    );
};

export default Main;


















































































