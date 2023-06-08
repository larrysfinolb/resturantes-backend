import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../../libs/pg.js';
import { config } from '../../config/index.js';

const login = async ({ username, password }) => {
  const client = await pool.connect();

  // FORMATEAR VALORES
  username = username.trim().toLowerCase();

  try {
    await client.query('BEGIN');

    const query1 = 'SELECT * FROM admins WHERE username = $1';
    const { rows: rows1 } = await client.query(query1, [username]);
    const result1 = rows1[0];

    if (!result1) throw { statusCode: 404, message: 'USERNAME_NOT_FOUND' };

    if (result1.password !== 'admin') {
      const isMatch = await bcrypt.compare(password, result1.password);
      if (!isMatch) throw { statusCode: 401, message: 'WRONG_PASSWORD' };
    } else if (password !== 'admin') throw { statusCode: 401, message: 'WRONG_PASSWORD' };

    const accessToken = jwt.sign({ sub: result1.id, role: 'admin' }, config.accessSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ sub: result1.id, role: 'admin' }, config.refreshSecret, { expiresIn: '7d' });

    await client.query('COMMIT');

    return { accessToken, refreshToken };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const refreshToken = async (user) => {
  const accessToken = jwt.sign({ sub: user.sub, role: 'admin' }, config.accessSecret, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ sub: user.sub, role: 'admin' }, config.refreshSecret, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};

const changeUsernamePassword = async (user, { username, password }) => {
  const client = await pool.connect();

  // FORMATEAR VALORES
  username = username?.trim().toLowerCase();

  // VALIDAR VALORES
  if (!username && !password) throw { statusCode: 400, message: 'INVALID_DATA' };

  try {
    await client.query('BEGIN');

    if (password) password = await bcrypt.hash(password, 10);

    const query1 =
      'UPDATE admins SET username = COALESCE($1, username), password = COALESCE($2, password) WHERE id = $3 RETURNING *';
    const { rows: rows1 } = await client.query(query1, [username, password, user.sub]);
    const result1 = rows1[0];

    if (!result1) throw { statusCode: 404, message: 'USER_NOT_FOUND' };

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default {
  login,
  refreshToken,
  changeUsernamePassword,
};
