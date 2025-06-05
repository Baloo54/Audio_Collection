export default function RecordStep({
  phraseIndex, recordings, isRecording, PHRASES,
  startRecording, stopRecording, restartPhrase,
  nextPhrase, goToDone
}) {
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
        <button onClick={goToDone}>Terminer la session</button>
      </div>
    </div>
  );
}
