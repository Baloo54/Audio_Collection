import { useState } from 'react';

export default function DoneStep({ recordings, age, gender, consent, numPhrases, onReset }) {
  const [isSending, setIsSending] = useState(false); // État pour désactiver les boutons pendant l'envoi

  // Fonction qui envoie les données au serveur backend
  const handleSendData = async () => {
    setIsSending(true); // On bloque les boutons
    const formData = new FormData();

    // Ajout des enregistrements audio et des phrases associées
    recordings.forEach(({ phrase, audio }, index) => {
      const fileName = `audio_${index + 1}.webm`;
      formData.append('recordings', audio, fileName);
      formData.append(`phrases[${index}]`, phrase);
    });

    // Ajout des informations utilisateur
    formData.append('age', age ?? '');
    formData.append('gender', gender ?? '');
    formData.append('consent', consent !== undefined ? consent.toString() : '');
    formData.append('numPhrases', numPhrases !== undefined ? numPhrases.toString() : '');

    try {
      // Appel à l'API backend (penser à modifier l'URL si backend sur un autre conteneur)
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('✅ Enregistrements et données envoyés avec succès.');
      } else {
        const errorText = await response.text();
        console.error('Erreur serveur:', errorText);
        alert('❌ Erreur lors de l’envoi des données.');
      }
    } catch (error) {
      console.error('Erreur réseau ou inattendue:', error);
      alert('❌ Erreur réseau : impossible de contacter le serveur.');
    } finally {
      setIsSending(false); // Réactivation des boutons
    }
  };

  return (
    <div className="card text-center">
      <h2>Merci pour votre participation</h2>
      <p>{recordings.length} enregistrements sauvegardés.</p>

      <div className="button-row">
        <button onClick={handleSendData} disabled={isSending}>
          {isSending ? 'Envoi en cours...' : 'Envoyer les données'}
        </button>
        <button onClick={onReset} disabled={isSending}>
          Nouvelle session
        </button>
      </div>
    </div>
  );
}
