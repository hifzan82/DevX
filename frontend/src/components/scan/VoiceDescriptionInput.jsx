
import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Square, AlertCircle } from 'lucide-react';

export default function VoiceDescriptionInput({
  value = '',
  onChange,
  label = 'Website description',
  placeholder = 'Describe your website or accessibility concern...',
  disabled = false,
}) {
  const [supported, setSupported] = useState(true);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const baselineRef = useRef('');
  const finalRef = useRef('');
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setSupported(Boolean(
      window.SpeechRecognition ||
      window.webkitSpeechRecognition
    ));

    return () => {
      const recognition = recognitionRef.current;
      recognitionRef.current = null;

      if (recognition) {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort();
      }
    };
  }, []);

  function stopRecording() {
    recognitionRef.current?.stop();
    setRecording(false);
  }

  function startRecording() {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition || disabled) return;

    setError('');
    baselineRef.current = String(value || '').trim();
    finalRef.current = '';

    const recognition = new SpeechRecognition();

    recognition.lang = navigator.language || 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = event => {
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0]?.transcript || '';

        if (event.results[i].isFinal) {
          finalRef.current += `${transcript.trim()} `;
        } else {
          interim += transcript;
        }
      }

      const combined = [
        baselineRef.current,
        finalRef.current.trim(),
        interim.trim(),
      ].filter(Boolean).join(' ');

      onChangeRef.current?.(combined);
    };

    recognition.onerror = event => {
      const messages = {
        'not-allowed': 'Microphone permission was denied.',
        'audio-capture': 'No microphone was detected.',
        'network': 'Speech recognition is unavailable due to a network error.',
        'no-speech': 'No speech was detected. Please try again.',
        'language-not-supported': 'This recognition language is not supported.',
        'service-not-allowed': 'Speech recognition is blocked by the browser.',
      };

      setError(messages[event.error] || 'Speech recognition failed.');
      setRecording(false);
    };

    recognition.onend = () => {
      setRecording(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setRecording(true);
    } catch {
      setError('Could not start speech recognition.');
      recognitionRef.current = null;
      setRecording(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="accesslens-description"
          className="text-[12px] font-bold text-zinc-700 dark:text-zinc-300"
        >
          {label}
        </label>

        <span
          aria-live="polite"
          className={`flex items-center gap-1.5 text-[11px] font-semibold ${
            recording
              ? 'text-red-600 dark:text-red-400'
              : 'text-zinc-400'
          }`}
        >
          {recording && (
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          )}
          {recording ? 'Listening...' : 'Voice input'}
        </span>
      </div>

      <div className="relative">
        <textarea
          id="accesslens-description"
          value={value}
          onChange={event => {
            if (recording) stopRecording();
            onChange?.(event.target.value);
          }}
          disabled={disabled}
          rows={4}
          placeholder={placeholder}
          className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-14 text-[13px] leading-6 text-zinc-800 shadow-sm outline-none transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />

        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          disabled={disabled || !supported}
          aria-label={recording ? 'Stop recording' : 'Start voice input'}
          aria-pressed={recording}
          title={
            !supported
              ? 'Voice recognition is unavailable in this browser'
              : recording
                ? 'Stop recording'
                : 'Describe using microphone'
          }
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            recording
              ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/30'
              : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-orange-300 hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
          }`}
        >
          {recording ? <Square size={16} /> : supported ? <Mic size={18} /> : <MicOff size={18} />}
        </button>
      </div>

      {!supported && (
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Voice recognition is not supported here. You can still type your description.
        </p>
      )}

      {error && (
        <p role="alert" className="flex items-center gap-2 text-[11px] text-red-600 dark:text-red-400">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
}
