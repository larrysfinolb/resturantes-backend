import dotenv from 'dotenv';

dotenv.config();

const config = {
  dbName: process.env.DB_NAME,
  dbHost: process.env.DB_HOST,
  dbPort: process.env.DB_PORT,
  dbUser: process.env.DB_USER,
  dbPass: process.env.DB_PASS,
  qrSecret: process.env.QR_SECRET,
  sesionSecret: process.env.SESION_SECRET,
};

export { config };
