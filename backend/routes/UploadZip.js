import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { insertSubmission } from '../db/Insert.js';

const router = express.Router();
const uploadDir = path.join('/tmp/audio_uploads');

// Configuration sécurisée de Multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers ZIP sont autorisés.'));
    }
  },
});

router.post('/upload-zip', upload.single('audioZip'), async (req, res) => {
  try {
    const {
      age = '',
      gender = '',
      consent = 'false',
      numPhrases = '0',
      phrases = '[]',
    } = req.body;

    const parsedPhrases = JSON.parse(phrases);

    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier ZIP reçu.' });
    }

    const ageStr = age.trim();
    const genderStr = gender.trim();
    const consentBool = consent === 'true';
    const numPhrasesInt = parseInt(numPhrases, 10);
    const zipPath = req.file.path;

    if (!Array.isArray(parsedPhrases) || parsedPhrases.some(p => typeof p !== 'string')) {
      return res.status(400).json({ error: 'Le format des phrases est invalide.' });
    }

    const userId = await insertSubmission({
      age: ageStr,
      gender: genderStr,
      consent: consentBool,
      numPhrases: numPhrasesInt,
      phrases: parsedPhrases,
      zipPath,
    });

    res.status(200).json({ message: 'Données enregistrées avec succès.', userId });
  } catch (err) {
    console.error('Erreur lors du traitement de la requête :', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
