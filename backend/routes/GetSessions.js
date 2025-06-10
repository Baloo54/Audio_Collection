import fs from 'fs';
import express from 'express';
import apiKeyAuth from '../midleware/ApiKeyAuth.js';
import { getAllSubmissions } from '../db/Select.js';

const router = express.Router();

router.get('/sessions', apiKeyAuth, async (_req, res) => {
  try {
    const sessions = await getAllSubmissions();

    // Enrichit les sessions avec un flag si le fichier ZIP est disponible
    const enriched = sessions.map(session => ({
      ...session,
      zipExists: fs.existsSync(session.zip_path),
    }));

    res.status(200).json({ sessions: enriched });
  } catch (err) {
    console.error('Erreur lors de la récupération des sessions :', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
