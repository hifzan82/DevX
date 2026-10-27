import { Mic, MicOff } from 'lucide-react';
import { useState } from 'react';
import { createSpeechRecognizer, isSpeechRecognitionSupported } from '../services/voiceService.js';

export default function VoiceInputButton({ onTranscript, className = '' }) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');

  const toggle = () => {
    if (!isSpeechRecognitionSupported()) {
      setError('Speech recognition not supported in this browser');
      return;
    }
    try {
      const rec = createSpeechRecognizer();
      if (listening) {
        rec.stop();
        setListening(false);
        return;
      }
      setError('');
      setListening(true);
      rec.onresult = (e) => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join(' ');
        onTranscript?.(transcript);
        setListening(false);
      };
      rec.onerror = (e) => {
        setError(e.error || 'Speech recognition error');
        setListening(false);
      };
      rec.onend = () => setListening(false);
      rec.start();
    } catch (e) {
      setError(e.message);
      setListening(false);
    }
  };

  return (
    <div className={className}>
      <button type="button" onClick={toggle} aria-label="Voice input" className="rounded-lg border p-2">
        {listening ? <MicOff size={16} /> : <Mic size={16} />}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
