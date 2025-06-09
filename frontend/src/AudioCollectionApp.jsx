import { useState, useRef, useEffect } from 'react';
import GetRandomPhrases from '@/components/GetRandomPhrases';
import IntroStep from '@/components/IntroStep.jsx';
import RecordStep from '@/components/RecordStep.jsx';
import DoneStep from '@/components/DoneStep.jsx';

/**
 * Composant principal de l'application de collecte vocale.
 * Il orchestre les différentes étapes : introduction, enregistrement, finalisation.
 */
export default function AudioCollectionApp() {
  // === ÉTAT DE L'APPLICATION ===
  const [step, setStep] = useState('intro'); // étape courante : intro | record | done

  // === DARK MODE ===
  const [darkMode, setDarkMode] = useState(false);

  // === INFORMATIONS UTILISATEUR ===
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [consent, setConsent] = useState(false);
  const [phraseCount, setPhraseCount] = useState(5); // nombre de phrases à enregistrer

  // === ENREGISTREMENT ===
  const [phraseIndex, setPhraseIndex] = useState(0); // index de la phrase actuelle
  const [recordings, setRecordings] = useState([]); // liste des enregistrements effectués
  const [isRecording, setIsRecording] = useState(false); // indicateur d’enregistrement en cours
  const [phrasesToRecord, setPhrasesToRecord] = useState([]); // phrases sélectionnées aléatoirement

  // === RÉFÉRENCES POUR LE MEDIA RECORDER ===
  const mediaRecorderRef = useRef(null); // référence à l'objet MediaRecorder
  const chunksRef = useRef([]); // buffer temporaire des données audio

  // === Token CSRF ===
  const [csrfToken, setCsrfToken] = useState('');

  // Récupération du token CSRF au montage du composant
  useEffect(() => {
    async function fetchCsrfToken() {
      try {
        const res = await fetch('http://localhost/api/csrf-token', {
          credentials: 'include', // important pour les cookies
        });
        const data = await res.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error('Erreur récupération token CSRF:', error);
      }
    }
    fetchCsrfToken();
  }, []);

  // Sync de la classe dark-mode sur body à chaque changement
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  /**
   * Démarre l'enregistrement vocal à l'aide de l'API MediaRecorder.
   */
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
      console.error('Erreur lors du démarrage de l’enregistrement :', error);
    }
  };

  /**
   * Arrête l'enregistrement vocal.
   */
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  /**
   * Réenregistre la phrase actuelle (supprime la dernière).
   */
  const restartPhrase = () => {
    setRecordings((prev) => prev.slice(0, -1));
    setIsRecording(false);
  };

  /**
   * Passe à la phrase suivante ou termine si c’est la dernière.
   */
  const nextPhrase = () => {
    if (phraseIndex + 1 < phrasesToRecord.length) {
      setPhraseIndex((prev) => prev + 1);
    } else {
      setStep('done');
    }
  };

  /**
   * Réinitialise complètement l'application (nouvelle session).
   */
  const resetSession = () => {
    setStep('intro');
    setAge('');
    setGender('');
    setConsent(false);
    setPhraseCount(5);
    setPhraseIndex(0);
    setRecordings([]);
    setPhrasesToRecord([]);
  };

  /**
   * Gère le démarrage d'une session d'enregistrement (post-intro).
   */
  const handleStart = () => {
    const selectedPhrases = GetRandomPhrases(phraseCount);
    setPhrasesToRecord(selectedPhrases);
    setStep('record');
  };

  // Composant bouton dark mode (simple)
  const DarkModeToggle = () => (
    <button
      aria-label="Toggle dark mode"
      onClick={() => setDarkMode((prev) => !prev)}
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        padding: '8px 12px',
        cursor: 'pointer',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: darkMode ? '#444' : '#eee',
        color: darkMode ? '#eee' : '#444',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        zIndex: 9999,
      }}
    >
      {darkMode ? '☀️ Light' : '🌙 Dark'}
    </button>
  );

  // === RENDU SELON L'ÉTAPE ACTUELLE ===
  return (
    <>
      <DarkModeToggle />
      {step === 'intro' && (
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
      )}
      {step === 'record' && (
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
      )}
      {step === 'done' && (
        <DoneStep
          recordings={recordings}
          age={age}
          gender={gender}
          consent={consent}
          numPhrases={phraseCount}
          csrfToken={csrfToken}
          onReset={resetSession}
        />
      )}
    </>
  );
}
