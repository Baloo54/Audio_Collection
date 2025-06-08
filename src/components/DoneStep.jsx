export default function DoneStep({ recordings, age, gender, consent, numPhrases, onReset }) {
  // Envoi des fichiers + données utilisateur + phrases
  const handleSendData = async () => {
    const formData = new FormData();

    recordings.forEach(({ phrase, audio }, index) => {
      const fileName = `audio_${index + 1}.webm`;
      formData.append('recordings', audio, fileName);
      formData.append(`phrases[${index}]`, phrase);
    });

    // Ajout des infos utilisateur
    formData.append('age', age ?? '');
    formData.append('gender', gender ?? '');
    formData.append('consent', consent !== undefined ? consent.toString() : '');
    formData.append('numPhrases', numPhrases !== undefined ? numPhrases.toString() : '');


    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Enregistrements et données envoyés avec succès.');
      } else {
        alert('Erreur lors de l’envoi des données.');
      }
    } catch (error) {
      console.error('Erreur lors de l’envoi:', error);
      alert('Erreur réseau.');
    }
  };

  return (
    <div className="card text-center">
      <h2>Merci pour votre participation</h2>
      <p>{recordings.length} enregistrements sauvegardés.</p>

      <button onClick={handleSendData}>Envoyer les données</button>
      <button onClick={onReset}>Nouvelle session</button>
    </div>
  );
}
