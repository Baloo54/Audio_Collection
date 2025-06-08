/**
 * Étape d'enregistrement de l'application.
 * Affiche la phrase à enregistrer, permet de lancer/arrêter l'enregistrement,
 * de réécouter, de télécharger et de passer à la phrase suivante.
 */
export default function RecordStep({
  phraseIndex,
  recordings,
  isRecording,
  PHRASES,
  startRecording,
  stopRecording,
  restartPhrase,
  nextPhrase,
  goToDone,
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

      {/* Section de contrôle audio si l'enregistrement est présent */}
      {currentRecording && (
        <div className="audio-controls">
          <button
            className="purple-badger-btn"
            onClick={() => {
              const blobUrl = URL.createObjectURL(currentRecording.audio);
              const audio = new Audio(blobUrl);
              audio.play();

              // Libération mémoire après lecture
              audio.onended = () => URL.revokeObjectURL(blobUrl);
            }}
          >
            ▶ Écouter
          </button>

          {/* Téléchargement direct de l'enregistrement */}
          <a
            href={URL.createObjectURL(currentRecording.audio)}
            download={`phrase-${phraseIndex + 1}.webm`}
            onClick={(e) => {
              // Retarde la révocation d'URL pour laisser le téléchargement se faire
              setTimeout(() => {
                URL.revokeObjectURL(e.currentTarget.href);
              }, 1000);
            }}
          >
            <button className="purple-badger-btn">Télécharger</button>
          </a>
        </div>
      )}

      {/* Boutons de contrôle de l'enregistrement */}
      <div className="button-row">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={recordings.length === phraseIndex + 1}
          >
            Enregistrer
          </button>
        ) : (
          <button onClick={stopRecording}>Arrêter</button>
        )}

        <button
          onClick={restartPhrase}
          disabled={recordings.length === 0}
        >
          Réenregistrer
        </button>

        <button
          onClick={nextPhrase}
          disabled={recordings.length <= phraseIndex}
        >
          Phrase suivante
        </button>

        <button onClick={goToDone}>
          Terminer la session
        </button>
      </div>
    </div>
  );
}
