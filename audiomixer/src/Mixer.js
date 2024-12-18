
import React, {useEffect} from 'react';
import Fader from './Fader';
import Button from './Button';
import axios from 'axios';

const Mixer = ({toggleMute,toggleSolo,isPlaying,adjustVolume,tracks,visualizerRefs,files,stopAllTracks,playAllTracks,progress,maxTrackDuration}) => {


    const drawWaveform = (track, index) => {
        const canvas = visualizerRefs.current[index];
        const canvasContext = canvas.getContext('2d');
        const analyser = track.analyserNode;
        analyser.fftSize = 256; // Smaller size for bar visualization
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const maxHeight = 500; // Maximum height of the bars
        let greenWaveHeight = 0;
        let redWaveHeight = 0;
        let isRising = false; // Tracks if the wave should rise
      
        // Smoothing factor to control how quickly the waves adjust to new heights
        const smoothingFactor = 0.05;
      
        const smoothTransition = (currentHeight, targetHeight) => {
          return currentHeight + (targetHeight - currentHeight) * smoothingFactor;
        };
      
        const draw = () => {
          requestAnimationFrame(draw);
          analyser.getByteFrequencyData(dataArray);
          canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      
          // Calculate the pan effect
          const panValue = track.pannerNode.pan.value;
      
          // Calculate the average amplitude for the green and red bars
          let greenHeight = 0;
          let redHeight = 0;
          for (let i = 0; i < bufferLength; i++) {
            const value = dataArray[i];
            if (value > 128) {
              redHeight += value;
            } else {
              greenHeight += value;
            }
          }
      
          // Normalize the heights to a max height of 230px
          greenHeight = (greenHeight / bufferLength) * (maxHeight / 128);
          redHeight = (redHeight / bufferLength) * (maxHeight / 128);
      
          const barWidth = canvas.width / 4; // Two bars: green and red
          const raiseStep = 10; // Step for raising
          const totalHideTime = 5000; // 5 seconds
          const framesPerSecond = 60; // Assuming 60 FPS for the animation
          const totalFrames = (totalHideTime / 1000) * framesPerSecond;
          const hideStep = maxHeight / totalFrames; // Step for smooth hiding over 5 seconds
      
          // Check for the pan value range 0.7 to 1 and -0.7 to -1
          if (panValue >= 0.7 && panValue <= 1) {
            // Handle the green wave (hide it)
            if (!isRising) {
              greenWaveHeight = Math.min(greenWaveHeight + raiseStep, redHeight); // Raise green to match red wave height
              if (greenWaveHeight >= redHeight) {
                isRising = true; // Start hiding after reaching the visible wave's height
              }
            } else {
              greenWaveHeight = Math.max(greenWaveHeight - hideStep, 0); // Smoothly hide the green wave over 5 seconds
            }
            redWaveHeight = redHeight; // Red wave remains fully visible
          } else if (panValue <= -0.7 && panValue >= -1) {
            // Handle the red wave (hide it)
            if (!isRising) {
              redWaveHeight = Math.min(redWaveHeight + raiseStep, greenHeight); // Raise red to match green wave height
              if (redWaveHeight >= greenHeight) {
                isRising = true; // Start hiding after reaching the visible wave's height
              }
            } else {
              redWaveHeight = Math.max(redWaveHeight - hideStep, 0); // Smoothly hide the red wave over 5 seconds
            }
            greenWaveHeight = greenHeight; // Green wave remains fully visible
          } else {
            // If pan is not in the range, reset everything to normal behavior and smooth transition
            isRising = false; // Reset the flag
      
            // Smooth the transition for normal wave behavior at 0 position
            greenWaveHeight = smoothTransition(greenWaveHeight, greenHeight); // Smooth transition for green wave
            redWaveHeight = smoothTransition(redWaveHeight, redHeight); // Smooth transition for red wave
          }
      
          // Draw the green wave
          canvasContext.fillStyle = 'green';
          canvasContext.fillRect(canvas.width / 4, canvas.height - greenWaveHeight, barWidth, greenWaveHeight);
      
          // Draw the red wave
          canvasContext.fillStyle = 'red';
          canvasContext.fillRect((canvas.width / 4) * 2, canvas.height - redWaveHeight, barWidth, redWaveHeight);
        };
      
        draw();
    };

    useEffect(() => {
        if (isPlaying) {
            tracks.forEach((track, index) => {
                drawWaveform(track, index);
            });
        }
    }, [isPlaying, tracks]);

    return (
        <>
            <div className="track--mixer">
                { (tracks.length > 0 )&& tracks.map((track, index) => (
                    <div key={index} className="track">
                        <div className="fader--mixer">
                            <div className='btn--group'>
                                <Button className={track.muted ? "btn btn--unmute" : "btn btn--mute"} label='M' onClick={() => toggleMute(index)} />
                                <Button className={track.soloed ? "btn btn--unsolo" : "btn btn--solo"} label='S' onClick={() => toggleSolo(index)} />
                            </div>
                            <div className='fade--wave'>
                                <Fader
                                    label="Volume"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    defaultValue={track.gainNode.gain.value}
                                    onChange={(value) => adjustVolume(index, value)}
                                />
                                <canvas ref={(el) => visualizerRefs.current[index] = el} width="40" height="250" />
                            </div>
                            <h3>{files[index].track_name}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {(tracks.length > 0)&&
                <div className="controls">
                    {isPlaying ? (
                        <button className="stop_tracks" onClick={stopAllTracks}>Stop</button>
                    ) : (
                        <button className="play_tracks" onClick={() => playAllTracks((progress / 100) * maxTrackDuration)}>Play</button>
                    )}
                </div>
            }

        </>
    );
};

export default Mixer;















































































