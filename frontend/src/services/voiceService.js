export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function createSpeechRecognizer() {
  if (!isSpeechRecognitionSupported()) throw new Error('Speech recognition not supported in this browser.');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  return recognition;
}
