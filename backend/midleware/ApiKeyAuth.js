import fs from 'fs';

const API_KEY = fs.readFileSync('/run/secrets/api_key', 'utf8').trim();

export default function apiKeyAuth(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: 'Clé API invalide ou absente' });
  }
  next();
}
