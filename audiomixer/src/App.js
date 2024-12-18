
import {useState , useEffect } from 'react';
import { AudioContextProvider } from './AudioContextProvide';
import Mixer from './Mixer';
import Main from './main'
import Api from './Helper';
import './App.css';


function App() {
  const [audioContext, setAudioContext] = useState(null);
  const [tracks , setTracks] = useState([]);
  const [title , setTitle] = useState('')

  useEffect(() => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(context);
    fetchAudioFiles();
  }, []);

  const fetchAudioFiles = async() => {
    try {
      const audioMixerRoot = document.getElementById('audiomixer-root');
      const postId = audioMixerRoot.getAttribute('data-post-id');
      console.log("postId" , postId)
      const endpoint = postId ? `/gettracks?post_id=${postId}` : '/gettracks';
      const response = await Api.get(endpoint); // Replace with your actual endpoint
      console.log("response" , response)
      const audioFiles = response.data; // Assuming the response is an array of audio file URLs
      setTitle(audioFiles.title)
      if(audioFiles && audioFiles.tracks.length > 0){
        setTracks(audioFiles.tracks);
      }
    } catch (error) {
      console.error('Error fetching audio files:', error);
      return [];
    }
  }

  return (
      <AudioContextProvider>
          <div className="App">
            <div className='audio--mixer'>
              {(audioContext && tracks.length > 0 )&& <Main audioContext={audioContext} files={tracks} title={title}/>}
            </div>
          </div>
      </AudioContextProvider>
  );
}

export default App;