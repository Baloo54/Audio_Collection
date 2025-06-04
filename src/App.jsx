import { useState, useRef } from 'react';

const PHRASES = [
  "Bonjour, comment allez-vous ?",
  "Le ciel est bleu aujourd'hui.",
  "J'aime apprendre le développement web.",
];

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
      <div className="card">
        <h1>Bienvenue</h1>
        <p>Merci de participer. Veuillez saisir votre âge et genre, puis confirmer votre consentement.</p>
        <input
          type="number"
          placeholder="Âge"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Genre</option>
          <option value="Homme">Homme</option>
          <option value="Femme">Femme</option>
          <option value="Autre">Autre</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          Je consens à participer à cette collecte anonyme.
        </label>
        <button disabled={!age || !gender || !consent} onClick={() => setStep('record')}>Commencer</button>
      </div>
    );
  }

  if (step === 'record') {
    const phrase = PHRASES[phraseIndex];

    return (
      <div className="card">
        <h2>Phrase {phraseIndex + 1} / {PHRASES.length}</h2>
        <p className="phrase">"{phrase}"</p>
        <div className="button-row">
          {!isRecording ? (
            <button onClick={startRecording}>Enregistrer</button>
          ) : (
            <button onClick={stopRecording}>Arrêter</button>
          )}
          <button onClick={restartPhrase} disabled={recordings.length === 0}>Réenregistrer</button>
          <button onClick={nextPhrase} disabled={recordings.length <= phraseIndex}>Phrase suivante</button>
          <button onClick={() => setStep('done')}>Terminer la session</button>
        </div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="card text-center">
        <h2>Merci pour votre participation</h2>
        <p>{recordings.length} enregistrements sauvegardés.</p>
        <button onClick={resetSession}>Nouvelle session</button>
      </div>
    );
  }

  return null;
}
