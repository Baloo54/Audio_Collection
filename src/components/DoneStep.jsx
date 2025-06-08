export default function DoneStep({ recordings, onReset }) {
  return (
    <div className="card text-center">
      {/* Titre de remerciement affiché à la fin de la session */}
      <h2>Merci pour votre participation</h2>

      {/* Affiche le nombre d'enregistrements audio sauvegardés */}
      <p>{recordings.length} enregistrements sauvegardés.</p>

      {/* Bouton permettant de réinitialiser la session et recommencer */}
      <button onClick={onReset}>Nouvelle session</button>
    </div>
  );
}
