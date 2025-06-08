import { useState, useRef } from 'react';
import { PHRASES } from '@/components/Phrases.jsx';
import IntroStep from '@/components/IntroStep.jsx';
import RecordStep from '@/components/RecordStep.jsx';
import DoneStep from '@/components/DoneStep.jsx';

/**
 * Composant principal de l'application de collecte vocale.
 * Il gère le cycle de vie de l'utilisateur : introduction, enregistrement, puis fin.
 */
export default function AudioCollectionApp() {
  // === États liés à la progression de l'application ===
  const [step, setStep] = useState('intro');           // Étape actuelle : 'intro', 'record', ou 'done'

  // === États liés aux informations utilisateur ===
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [consent, setConsent] = useState(false);

  // === États liés à l'enregistrement ===
  const [phraseIndex, setPhraseIndex] = useState(0);   // Index de la phrase actuelle dans PHRASES
  const [recordings, setRecordings] = useState([]);    // Liste des enregistrements réalisés
  const [isRecording, setIsRecording] = useState(false); // Statut d'enregistrement en cours

  // === Références pour MediaRecorder et les données audio ===
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // === Démarrer un enregistrement ===
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
        const phrase = PHRASES[phraseIndex];
        setRecordings((prev) => [...prev, { phrase, audio: blob }]);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erreur lors du démarrage de l’enregistrement:', error);
    }
  };

  // === Arrêter l'enregistrement ===
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // === Recommencer la phrase actuelle ===
  const restartPhrase = () => {
    setRecordings((prev) => prev.slice(0, -1));
    setIsRecording(false);
  };

  // === Passer à la phrase suivante ou terminer ===
  const nextPhrase = () => {
    if (phraseIndex + 1 < PHRASES.length) {
      setPhraseIndex((prev) => prev + 1);
    } else {
      setStep('done');
    }
  };

  // === Réinitialiser la session ===
  const resetSession = () => {
    setStep('intro');
    setAge('');
    setGender('');
    setConsent(false);
    setPhraseIndex(0);
    setRecordings([]);
  };

  // === Affichage dynamique en fonction de l'étape ===
  switch (step) {
    case 'intro':
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
    
    case 'record':
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
    
    case 'done':
      return (
        <DoneStep
          recordings={recordings}
          onReset={resetSession}
        />
      );
    
    default:
      return null; // Cas de secours si un step non prévu est défini
  }
}
