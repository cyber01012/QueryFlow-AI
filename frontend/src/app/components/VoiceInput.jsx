'use client';

import { useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic } from 'lucide-react';

export default function VoiceInput({ onTranscriptChange }) {
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const [hasStarted, setHasStarted] = useState(false);

  const handleVoiceInput = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
      setHasStarted(true);
    }
  };

  // send transcript updates back to QueryForm
  if (hasStarted) {
    onTranscriptChange(transcript);
  }

  return (
    <button
      type="button"
      onClick={handleVoiceInput}
      className={`flex items-center justify-center w-11 h-11 rounded-full mr-3 transition-transform duration-300 
        ${listening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-[#7257c5] hover:bg-[#503c8f]'}
        hover:scale-105 text-white shadow-md`}
      title={listening ? 'Listening...' : 'Click to speak'}
    >
      <Mic size={22} />
    </button>
  );
}