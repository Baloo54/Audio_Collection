import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const PHRASES = [
  "Bonjour, comment allez-vous ?",
  "Le ciel est bleu aujourd'hui.",
  "J'aime apprendre le développement web.",
  // Ajoutez d'autres phrases ici si nécessaire
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
      <Card className="max-w-xl mx-auto mt-10 p-6 space-y-4">
        <CardContent>
          <h1 className="text-xl font-bold">Bienvenue</h1>
          <p>Merci de participer. Veuillez saisir votre âge et genre, puis confirmer votre consentement.</p>
          <input
            type="number"
            placeholder="Âge"
            className="w-full p-2 border rounded"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          <select
            className="w-full p-2 border rounded"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Genre</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
            <option value="Autre">Autre</option>
          </select>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>Je consens à participer à cette collecte anonyme.</span>
          </label>
          <Button disabled={!age || !gender || !consent} onClick={() => setStep('record')}>Commencer</Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'record') {
    const phrase = PHRASES[phraseIndex];

    return (
      <Card className="max-w-xl mx-auto mt-10 p-6 space-y-4">
        <CardContent>
          <h2 className="text-lg font-semibold">Phrase {phraseIndex + 1} / {PHRASES.length}</h2>
          <p className="text-xl italic">"{phrase}"</p>
          <div className="space-x-2">
            {!isRecording ? (
              <Button onClick={startRecording}>Enregistrer</Button>
            ) : (
              <Button onClick={stopRecording}>Arrêter</Button>
            )}
            <Button onClick={restartPhrase} disabled={recordings.length === 0}>Réenregistrer</Button>
            <Button onClick={nextPhrase} disabled={recordings.length <= phraseIndex}>Phrase suivante</Button>
            <Button onClick={() => setStep('done')}>Terminer la session</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'done') {
    return (
      <Card className="max-w-xl mx-auto mt-10 p-6 space-y-4 text-center">
        <CardContent>
          <h2 className="text-xl font-bold">Merci pour votre participation</h2>
          <p>{recordings.length} enregistrements sauvegardés.</p>
          <Button onClick={resetSession}>Nouvelle session</Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
