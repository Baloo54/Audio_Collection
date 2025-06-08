import express from 'express';
import uploadZipRoute from './routes/UploadZip.js';

const app = express();

// Middleware global
app.use(express.json());

// Routes
app.use('/api', uploadZipRoute);

export default app;
