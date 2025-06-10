import helmet from 'helmet';
import cors from 'cors';

export const SecurityHeaders = helmet();

export const CorsOptions = cors({
  origin: process.env.FRONT_ORIGIN || 'https://localhost',
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
});
