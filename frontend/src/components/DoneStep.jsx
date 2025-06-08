import React, { useState } from 'react';
import JSZip from 'jszip';

export default function DoneStep({ recordings, age, gender, consent, numPhrases, onReset }) {
  const [isSending, setIsSending] = useState(false);

  const handleSendData = async () => {
    setIsSending(true);

    try {
      const zip = new JSZip();

      // Ajouter tous les fichiers audio dans le ZIP
      recordings.forEach(({ audio }, index) => {
        const fileName = `audio_${index + 1}.webm`;
        zip.file(fileName, audio);
      });

      // Générer le ZIP Blob
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Créer FormData et ajouter le ZIP
      const formData = new FormData();
      formData.append('audioZip', zipBlob, 'audios.zip');

      // Ajouter les phrases sérialisées en JSON
      const phrasesArray = recordings.map(r => r.phrase);
      formData.append('phrases', JSON.stringify(phrasesArray));

      // Ajouter les infos utilisateur
      formData.append('age', age ?? '');
      formData.append('gender', gender ?? '');
      formData.append('consent', consent !== undefined ? consent.toString() : '');
      formData.append('numPhrases', numPhrases !== undefined ? numPhrases.toString() : '');

      // Envoyer la requête POST
      const response = await fetch('http://localhost:5000/api/upload-zip', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('✅ Données envoyées avec succès.');
      } else {
        const errorText = await response.text();
        console.error('Erreur serveur:', errorText);
        alert('❌ Erreur lors de l’envoi des données.');
      }
    } catch (error) {
      console.error('Erreur réseau ou inattendue:', error);
      alert('❌ Erreur réseau : impossible de contacter le serveur.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="card text-center" style={{ padding: '1rem', maxWidth: '400px', margin: 'auto' }}>
      <h2>Merci pour votre participation</h2>

      <button onClick={handleSendData} disabled={isSending} style={{ marginRight: '1rem' }}>
        {isSending ? 'Envoi en cours...' : 'Envoyer les données'}
      </button>
      <button onClick={onReset} disabled={isSending}>
        Nouvelle session
      </button>
    </div>
  );
}
