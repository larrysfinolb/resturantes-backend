import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../libs/pg.js';
import { config } from '../config/index.js';

const verify = async () => {
  return { message: 'Verified' };
};

const login = async (body) => {
  const { dni, password } = body;

  const query = 'SELECT * FROM customers WHERE dni = $1';
  const { rows } = await pool.query(query, [dni]);
  const result = rows[0];

  if (!result) throw { statusCode: 400, statusMessage: 'Not found', message: 'Customer not found' };

  const isMatch = await bcrypt.compare(password, result.password);

  if (!isMatch) throw { statusCode: 401, statusMessage: 'Unauthorized', message: 'Wrong password' };

  const payload = {
    sub: result.id,
    name: result.full_name,
  };

  const token = jwt.sign(payload, config.sesionSecret, { expiresIn: '30min' });

  return token;
};

const signup = async (body) => {
  const { fullName, dni, password, phone } = body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = 'SELECT * FROM customers WHERE dni = $1';
    const { rows: rows1 } = await client.query(query1, [dni]);
    const result1 = rows1[0];

    if (result1) throw { statusCode: 409, statusMessage: 'Conflict', message: 'Customer already exists' };

    const hashedPassword = await bcrypt.hash(password, 10);

    const query2 = 'INSERT INTO customers (full_name, dni, password, phone) VALUES ($1, $2, $3, $4) RETURNING *';
    const { rows: rows2 } = await client.query(query2, [fullName, dni, hashedPassword, phone]);
    const result2 = rows2[0];

    await client.query('COMMIT');
    return result2;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export default { verify, login, signup };
