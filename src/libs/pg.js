import pkg from 'pg';
import { config } from '../config/index.js';

const { Pool } = pkg;

const options = {
  user: config.dbUser,
  host: config.dbHost,
  database: config.dbName,
  password: config.dbPass,
  port: config.dbPort,
};

if (config.env === 'production') {
  options.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = new Pool(options);

export { pool };
