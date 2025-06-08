import { useState, useRef } from 'react';
import GetRandomPhrases from '@/components/GetRandomPhrases';
import IntroStep from '@/components/IntroStep.jsx';
import RecordStep from '@/components/RecordStep.jsx';
import DoneStep from '@/components/DoneStep.jsx';

/**
 * Composant principal de l'application de collecte vocale.
 * Il gère le cycle de vie de l'utilisateur : introduction, enregistrement, puis fin.
 */
export default function AudioCollectionApp() {
  // === États liés à la progression de l'application ===
  const [step, setStep] = useState('intro');

  // === États liés aux informations utilisateur ===
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [consent, setConsent] = useState(false);
  const [phraseCount, setPhraseCount] = useState(5); // <== changé nom

  // === États liés à l'enregistrement ===
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [phrasesToRecord, setPhrasesToRecord] = useState([]);

  // === Références pour MediaRecorder et les données audio ===
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const phrase = phrasesToRecord[phraseIndex];
        setRecordings((prev) => [...prev, { phrase, audio: blob }]);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erreur lors du démarrage de l’enregistrement:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const restartPhrase = () => {
    setRecordings((prev) => prev.slice(0, -1));
    setIsRecording(false);
  };

  const nextPhrase = () => {
    if (phraseIndex + 1 < phrasesToRecord.length) {
      setPhraseIndex((prev) => prev + 1);
    } else {
      setStep('done');
    }
  };

  const resetSession = () => {
    setStep('intro');
    setAge('');
    setGender('');
    setConsent(false);
    setPhraseCount(5); // reset
    setPhraseIndex(0);
    setRecordings([]);
    setPhrasesToRecord([]);
  };

  const handleStart = () => {
    const selectedPhrases = GetRandomPhrases(phraseCount); // <== utilise phraseCount
    setPhrasesToRecord(selectedPhrases);
    setStep('record');
  };

  switch (step) {
    case 'intro':
      return (
        <IntroStep
          age={age}
          gender={gender}
          consent={consent}
          phraseCount={phraseCount}
          setAge={setAge}
          setGender={setGender}
          setConsent={setConsent}
          setPhraseCount={setPhraseCount}
          onStart={handleStart}
        />
      );

    case 'record':
      return (
        <RecordStep
          phraseIndex={phraseIndex}
          recordings={recordings}
          isRecording={isRecording}
          PHRASES={phrasesToRecord}
          startRecording={startRecording}
          stopRecording={stopRecording}
          restartPhrase={restartPhrase}
          nextPhrase={nextPhrase}
          goToDone={() => setStep('done')}
        />
      );

    case 'done':
    return (
      <DoneStep
        recordings={recordings}
        age={age}
        gender={gender}
        consent={consent}
        numPhrases={numPhrases}
        onReset={resetSession}
      />
    );


    default:
      return null;
  }
}
