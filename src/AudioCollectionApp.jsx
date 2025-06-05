import { useState, useRef } from 'react';
import { PHRASES } from '@/components/Phrases.jsx';
import IntroStep from '@/components/IntroStep.jsx';
import RecordStep from '@/components/RecordStep.jsx';
import DoneStep from '@/components/DoneStep.jsx';

export default function AudioCollectionApp() {
  const [step, setStep] = useState('intro');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [consent, setConsent] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      setRecordings([...recordings, { phrase: PHRASES[phraseIndex], audio: blob }]);
    };
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const restartPhrase = () => {
    setRecordings(recordings.slice(0, -1));
    setIsRecording(false);
  };

  const nextPhrase = () => {
    if (phraseIndex + 1 < PHRASES.length) {
      setPhraseIndex(phraseIndex + 1);
    } else {
      setStep('done');
    }
  };

  const resetSession = () => {
    setStep('intro');
    setAge('');
    setGender('');
    setConsent(false);
    setPhraseIndex(0);
    setRecordings([]);
  };

  if (step === 'intro') {
    return (
      <IntroStep
        age={age}
        gender={gender}
        consent={consent}
        setAge={setAge}
        setGender={setGender}
        setConsent={setConsent}
        onStart={() => setStep('record')}
      />
    );
  }

  if (step === 'record') {
    return (
      <RecordStep
        phraseIndex={phraseIndex}
        recordings={recordings}
        isRecording={isRecording}
        PHRASES={PHRASES}
        startRecording={startRecording}
        stopRecording={stopRecording}
        restartPhrase={restartPhrase}
        nextPhrase={nextPhrase}
        goToDone={() => setStep('done')}
      />
    );
  }

  if (step === 'done') {
    return <DoneStep recordings={recordings} onReset={resetSession} />;
  }

  return null;
}
