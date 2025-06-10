import { useState, useRef, useEffect } from 'react';
import GetRandomPhrases from '@/components/GetRandomPhrases';
import IntroStep from '@/components/IntroStep.jsx';
import RecordStep from '@/components/RecordStep.jsx';
import DoneStep from '@/components/DoneStep.jsx';
import FetchSessionsStep from '@/components/FetchSessionsStep.jsx';

/**
 * Composant principal de l'application de collecte vocale.
 * Il orchestre les différentes étapes : introduction, enregistrement, finalisation.
 */
export default function AudioCollectionApp() {
  // État pour gérer l'étape actuelle : 'intro', 'record' ou 'done'
  const [step, setStep] = useState('intro');

  // État pour le mode sombre (true = sombre, false = clair)
  const [darkMode, setDarkMode] = useState(false);

  // Données utilisateur collectées dans l'intro
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [consent, setConsent] = useState(false);
  const [phraseCount, setPhraseCount] = useState(5);

  // Gestion de l'enregistrement des phrases
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [phrasesToRecord, setPhrasesToRecord] = useState([]);

  // Références pour le MediaRecorder et ses données
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Token CSRF pour sécuriser les requêtes POST
  const [csrfToken, setCsrfToken] = useState('');

  // Gestion de la clé API et affichage du panneau de sessions
  const [apiKey, setApiKey] = useState('');
  const [showFetchSessions, setShowFetchSessions] = useState(false);

  // Récupération du token CSRF dès le montage du composant
  useEffect(() => {
    async function fetchCsrfToken() {
      try {
        const res = await fetch('/api/csrf-token', {
          credentials: 'include',
        });
        const data = await res.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error('Erreur récupération token CSRF:', error);
      }
    }
    fetchCsrfToken();
  }, []);

  // Appliquer ou retirer la classe dark-mode sur le body selon l'état darkMode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  /**
   * Démarre l'enregistrement audio via l'API MediaRecorder.
   */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Collecte les données audio lors de l'enregistrement
      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      // À la fin de l'enregistrement, crée un Blob audio et l'ajoute aux enregistrements
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
   * Arrête l'enregistrement en cours.
   */
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  /**
   * Permet de réenregistrer la phrase courante en supprimant la dernière prise.
   */
  const restartPhrase = () => {
    setRecordings((prev) => prev.slice(0, -1));
    setIsRecording(false);
  };

  /**
   * Passe à la phrase suivante ou termine la session si c'était la dernière.
   */
  const nextPhrase = () => {
    if (phraseIndex + 1 < phrasesToRecord.length) {
      setPhraseIndex((prev) => prev + 1);
    } else {
      setStep('done');
    }
  };

  /**
   * Réinitialise toute la session pour repartir de zéro.
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
    setShowFetchSessions(false);
    setApiKey('');
  };

  /**
   * Initialise les phrases à enregistrer et passe à l'étape d'enregistrement.
   */
  const handleStart = () => {
    const selectedPhrases = GetRandomPhrases(phraseCount);
    setPhrasesToRecord(selectedPhrases);
    setStep('record');
  };

  /**
   * Composant bouton pour basculer le mode sombre.
   */
  const DarkModeToggle = () => (
    <button
      aria-label="Toggle dark mode"
      onClick={() => setDarkMode((prev) => !prev)}
      className="dark-mode-toggle"
    >
      {darkMode ? '☀️ Light' : '🌙 Dark'}
    </button>
  );

  return (
    <>
      <DarkModeToggle />

      {/* Zone de saisie de la clé API pour charger les sessions */}
      <div className="api-key-input-container">
        <input
          id="apiKeyInput"
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Entrez votre clé API"
          className="api-key-input"
        />
        <button
          onClick={() => setShowFetchSessions(true)}
          disabled={!apiKey.trim()}
          className="api-key-load-button"
        >
          Charger
        </button>
      </div>

      {/* Étape d'introduction avec formulaire utilisateur */}
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

      {/* Étape d'enregistrement des phrases */}
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

      {/* Étape finale : soumission et fin de session */}
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

      {/* Affichage facultatif du panneau de récupération des sessions */}
      {showFetchSessions && <FetchSessionsStep apiKey={apiKey} />}
    </>
  );
}
