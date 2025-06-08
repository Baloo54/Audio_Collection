export default function RecordStep({
  phraseIndex, recordings, isRecording, PHRASES,
  startRecording, stopRecording, restartPhrase,
  nextPhrase, goToDone
}) {
  // Récupère la phrase actuelle à lire
  const phrase = PHRASES[phraseIndex];

  // Récupère l'enregistrement correspondant à la phrase actuelle (s'il existe)
  const currentRecording = recordings[phraseIndex];

  return (
    <div className="card">
      <h2>
        {/* Affiche le numéro de la phrase en cours */}
        Phrase {phraseIndex + 1} / {PHRASES.length}

        {/* Affiche un point rouge animé si l'enregistrement est en cours */}
        {isRecording && (
          <span style={{
            marginLeft: '10px',
            display: 'inline-block',
            width: '10px',
            height: '10px',
            backgroundColor: 'red',
            borderRadius: '50%',
            animation: 'pulse 1s infinite'
          }} />
        )}
      </h2>

      {/* Affiche la phrase à lire entre guillemets */}
      <p className="phrase">"{phrase}"</p>

      {/* Si un enregistrement a été fait pour cette phrase, affiche les contrôles audio */}
      {currentRecording && (
        <div className="audio-controls">
          {/* Permet d'écouter l'enregistrement */}
          <audio
            controls
            src={URL.createObjectURL(currentRecording.audio)}
          />

          {/* Lien de téléchargement du fichier audio */}
          <a
            href={URL.createObjectURL(currentRecording.audio)}
            download={`phrase-${phraseIndex + 1}.webm`}
          >
            <button>Télécharger</button>
          </a>
        </div>
      )}

      {/* Boutons de contrôle de l'enregistrement */}
      <div className="button-row">
        {/* Bouton pour démarrer ou arrêter l'enregistrement */}
        {!isRecording ? (
          <button onClick={startRecording}>Enregistrer</button>
        ) : (
          <button onClick={stopRecording}>Arrêter</button>
        )}

        {/* Réenregistrement possible uniquement si un enregistrement a été fait */}
        <button onClick={restartPhrase} disabled={recordings.length === 0}>
          Réenregistrer
        </button>

        {/* Bouton pour passer à la phrase suivante, activé seulement si la phrase actuelle est enregistrée */}
        <button onClick={nextPhrase} disabled={recordings.length <= phraseIndex}>
          Phrase suivante
        </button>

        {/* Terminer la session à tout moment */}
        <button onClick={goToDone}>Terminer la session</button>
      </div>

      {/* Animation CSS pour le point rouge d'enregistrement */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
