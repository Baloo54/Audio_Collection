import React, { useState } from 'react';

export default function FetchSessionsStep({ apiKey }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charge les sessions depuis le serveur
  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('sessions', {
        headers: {
          'x-api-key': apiKey,
        },
      });

      if (!res.ok) {
        throw new Error(`Erreur ${res.status} : ${res.statusText}`);
      }

      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Télécharge le ZIP d'une session
  const downloadZip = async (sessionId, zipFilename = 'recordings.zip') => {
    try {
      const res = await fetch(`/sessions/${sessionId}/download`, {
        headers: {
          'x-api-key': apiKey,
        },
      });

      if (!res.ok) {
        throw new Error(`Erreur téléchargement ${res.status} : ${res.statusText}`);
      }

      // Récupère le blob (fichier ZIP)
      const blob = await res.blob();

      // Crée un lien temporaire pour lancer le téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = zipFilename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erreur lors du téléchargement : ' + err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Sessions d'enregistrement</h2>

      <button onClick={fetchSessions} disabled={loading}>
        {loading ? 'Chargement...' : 'Charger les sessions'}
      </button>

      {error && (
        <p style={{ color: 'red' }}>Erreur : {error}</p>
      )}

      {sessions.length === 0 && !loading && <p>Aucune session chargée.</p>}

      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {sessions.map((session) => (
          <li key={session.id} style={{ margin: '15px 0', borderBottom: '1px solid #ccc', paddingBottom: 10 }}>
            <p>
              <strong>ID :</strong> {session.id} — <strong>Age :</strong> {session.age} — <strong>Genre :</strong> {session.gender} — <strong>Consentement :</strong> {session.consent ? 'Oui' : 'Non'}
            </p>
            <p>
              <strong>Phrases :</strong> {session.phrases?.join(', ')}
            </p>
            <p>
              <button onClick={() => downloadZip(session.id, `session_${session.id}.zip`)}>
                Télécharger ZIP
              </button>
              {session.zipExists === false && <span style={{ color: 'orange', marginLeft: 10 }}>ZIP non disponible</span>}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
