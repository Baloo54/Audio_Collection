import csrf from 'csurf';
import cookieParser from 'cookie-parser';

export const cookieParserMiddleware = cookieParser();

export const csrfProtection = csrf({ cookie: true });

export const sendCsrfToken = (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
};
