import React, { useState } from 'react';
import JSZip from 'jszip';

export default function DoneStep({ recordings, age, gender, consent, numPhrases, csrfToken, onReset }) {
  const [isSending, setIsSending] = useState(false);

  const handleSendData = async () => {
      setIsSending(true);

      try {
        const zip = new JSZip();

        recordings.forEach(({ audio }, index) => {
          const fileName = `audio_${index + 1}.webm`;
          zip.file(fileName, audio);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });

        const formData = new FormData();
        formData.append('audioZip', zipBlob, 'audios.zip');

        const phrasesArray = recordings.map(r => r.phrase);
        formData.append('phrases', JSON.stringify(phrasesArray));

        formData.append('age', age ?? '');
        formData.append('gender', gender ?? '');
        formData.append('consent', consent !== undefined ? consent.toString() : '');
        formData.append('numPhrases', numPhrases !== undefined ? numPhrases.toString() : '');

        const response = await fetch('https://localhost/api/upload-zip', {
          method: 'POST',
          body: formData,
          credentials: 'include',          // IMPORTANT : pour envoyer les cookies de session
          headers: {
            'X-CSRF-Token': csrfToken,    // <-- Ajout du header CSRF
          },
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
