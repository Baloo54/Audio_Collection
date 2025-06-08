export default function RecordStep({
  phraseIndex, recordings, isRecording, PHRASES,
  startRecording, stopRecording, restartPhrase,
  nextPhrase, goToDone
}) {
  const phrase = PHRASES[phraseIndex];
  const currentRecording = recordings[phraseIndex];

  return (
    <div className="card">
      <h2>
        Phrase {phraseIndex + 1} / {PHRASES.length}
        {isRecording && <span className="recording-indicator" />}
      </h2>

      <p className="phrase">"{phrase}"</p>

      {currentRecording && (
        <div className="audio-controls">
        <button
          className="purple-badger-btn"
          onClick={() => {
            // Rejoue toujours le même objet audio (évite accumulation de mémoire)
            const blobUrl = URL.createObjectURL(currentRecording.audio);
            const audio = new Audio(blobUrl);
            audio.play();

            // Libère la mémoire du blob quand le son est fini
            audio.onended = () => URL.revokeObjectURL(blobUrl);
          }}
        >
          ▶ Écouter
        </button>

          <a href={URL.createObjectURL(currentRecording.audio)}
             download={`phrase-${phraseIndex + 1}.webm`}>
            <button className="purple-badger-btn">Télécharger</button>
          </a>
        </div>
      )}

      <div className="button-row">
        {!isRecording ? (
          <button onClick={startRecording} disabled={recordings.length !== 0}>Enregistrer</button>
        ) : (
          <button onClick={stopRecording}>Arrêter</button>
        )}
        <button onClick={restartPhrase} disabled={recordings.length === 0}>
          Réenregistrer
        </button>
        <button onClick={nextPhrase} disabled={recordings.length <= phraseIndex}>
          Phrase suivante
        </button>
        <button onClick={goToDone}>Terminer la session</button>
      </div>
    </div>
  );
}
