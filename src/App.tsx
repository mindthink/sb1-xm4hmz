import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Play, Pause, RefreshCw, Volume2, VolumeX, ChevronUp, ChevronDown } from 'lucide-react';

function App() {
  const timeOptions = [5, 10, 15, 30];
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  const [time, setTime] = useState(timeOptions[selectedTimeIndex] * 60);
  const [isActive, setIsActive] = useState(false);
  const [score, setScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [ripple, setRipple] = useState(false);

  const playEndMusic = useCallback(() => {
    if (isMuted) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [440, 494, 523, 587, 659, 698, 784, 880];
    const noteDuration = 0.2;

    notes.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * noteDuration);

      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * noteDuration);
      gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + index * noteDuration + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + (index + 1) * noteDuration);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(audioContext.currentTime + index * noteDuration);
      oscillator.stop(audioContext.currentTime + (index + 1) * noteDuration);
    });
  }, [isMuted]);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      playEndMusic();
    }

    return () => clearInterval(interval);
  }, [isActive, time, playEndMusic]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setTime(timeOptions[selectedTimeIndex] * 60);
    setIsActive(false);
    setScore(0);
  };

  const handleClick = () => {
    if (isActive) {
      setScore((prevScore) => prevScore + 1);
      setRipple(true);
      setTimeout(() => setRipple(false), 600);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const changeTime = (direction: 'up' | 'down') => {
    if (!isActive) {
      setSelectedTimeIndex((prevIndex) => {
        const newIndex = direction === 'up' 
          ? (prevIndex + 1) % timeOptions.length 
          : (prevIndex - 1 + timeOptions.length) % timeOptions.length;
        setTime(timeOptions[newIndex] * 60);
        return newIndex;
      });
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center text-white" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")'}}>
      <div className="bg-black bg-opacity-50 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-8 text-center">Focus Training</h1>
        <div className="flex items-center justify-center mb-6">
          <button 
            onClick={() => changeTime('up')} 
            className="text-2xl mr-2 focus:outline-none disabled:opacity-50"
            disabled={isActive}
          >
            <ChevronUp />
          </button>
          <div className="flex items-center">
            <Clock className="w-8 h-8 mr-2" />
            <span className="text-3xl font-semibold">{formatTime(time)}</span>
          </div>
          <button 
            onClick={() => changeTime('down')} 
            className="text-2xl ml-2 focus:outline-none disabled:opacity-50"
            disabled={isActive}
          >
            <ChevronDown />
          </button>
        </div>
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={toggleTimer}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button
            onClick={resetTimer}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            <RefreshCw className="w-6 h-6" />
          </button>
          <button
            onClick={toggleMute}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>
        <div className="text-center mb-6">
          <p className="text-xl font-semibold">Score: {score}</p>
        </div>
        <div className="relative w-64 h-64 mx-auto">
          <div
            onClick={handleClick}
            className={`w-full h-full rounded-full cursor-pointer transition-all duration-200 ${
              isActive ? 'bg-yellow-300 hover:bg-yellow-400' : 'bg-gray-400 cursor-not-allowed'
            }`}
          ></div>
          {ripple && (
            <div className="absolute top-0 left-0 w-full h-full rounded-full animate-ripple"></div>
          )}
        </div>
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Instructions:</h2>
          <ol className="list-decimal list-inside text-left">
            <li>Use the up/down arrows to select a time duration</li>
            <li>Click the play button to start the timer</li>
            <li>Focus on the circle and click it whenever you notice your mind wandering</li>
            <li>Try to maintain focus for the entire session</li>
            <li>Your score represents how many times you caught yourself losing focus</li>
            <li>A melody will play when the session ends (unless muted)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default App;