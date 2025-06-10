import express from 'express';
import { SecurityHeaders, CorsOptions } from './midleware/SecurityHeaders.js';
import { cookieParserMiddleware, csrfProtection, sendCsrfToken } from './midleware/Crsf.js';
import uploadZipRoute from './routes/UploadZip.js';
import getSessionsRoute from './routes/GetSessions.js';
import downloadZipRoute from './routes/DownloadZip.js';

const app = express();

// 🔐 Sécurité
app.use(SecurityHeaders);
app.use(cookieParserMiddleware);
app.use(CorsOptions);

// 📦 Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔐 CSRF
app.use(csrfProtection);
app.get('/api/csrf-token', sendCsrfToken);

// 📁 Routes
app.use('/api', uploadZipRoute);
app.use('/api', getSessionsRoute);
app.use('/api', downloadZipRoute);

export default app;




