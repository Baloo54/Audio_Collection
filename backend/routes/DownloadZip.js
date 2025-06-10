import path from 'path';
import express from 'express';
import fs from 'fs';
import { getZipPathById } from '../db/Select.js';
import apiKeyAuth from '../midleware/ApiKeyAuth.js';

const router = express.Router();

router.get('/sessions/:id/download', apiKeyAuth, async (req, res) => {
  const sessionId = req.params.id;

  try {
    const zipPath = await getZipPathById(sessionId);

    if (!zipPath || !fs.existsSync(zipPath)) {
      return res.status(404).json({ error: 'Fichier ZIP non trouvé pour cette session.' });
    }

    return res.download(zipPath, path.basename(zipPath));
  } catch (err) {
    console.error('Erreur téléchargement ZIP :', err.message);
    return res.status(500).json({ error: 'Erreur serveur lors du téléchargement.' });
  }
});

export default router;
