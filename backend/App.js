import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';

import uploadZipRoute from './routes/UploadZip.js';

const app = express();

// 🔐 Headers de sécurité
app.use(helmet());

// 🔐 Cookies nécessaires pour CSRF
app.use(cookieParser());

// 🌐 CORS - adapte l'origine à ton front
app.use(cors({
  origin: process.env.FRONT_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
}));

// 📦 Parsing JSON et form-data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔐 Middleware CSRF
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// ✅ Route pour récupérer le token CSRF (appelé au chargement du front)
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// 📁 Routes d’upload protégées par CSRF
app.use('/api', uploadZipRoute);

// Route de test
app.get('/', (_req, res) => {
  res.send('✅ API opérationnelle avec CSRF');
});

export default app;
