export default function DoneStep({ recordings, onReset }) {
  return (
    <div className="card text-center">
      <h2>Merci pour votre participation</h2>
      <p>{recordings.length} enregistrements sauvegardés.</p>
      <button onClick={onReset}>Nouvelle session</button>
    </div>
  );
}
