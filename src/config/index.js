import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') dotenv.config();

const config = {
  dbName: process.env.DB_NAME,
  dbHost: process.env.DB_HOST,
  dbPort: process.env.DB_PORT,
  dbUser: process.env.DB_USER,
  dbPass: process.env.DB_PASS,
  smtpEmail: process.env.SMTP_EMAIL,
  smtpPassword: process.env.SMTP_PASSWORD,
  qrSecret: process.env.QR_SECRET,
  verifySecret: process.env.VERIFY_SECRET,
  accessSecret: process.env.ACCESS_SECRET,
  refreshSecret: process.env.REFRESH_SECRET,
  azureStorageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
};

export { config };
