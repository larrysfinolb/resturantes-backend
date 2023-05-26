import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../libs/pg.js';
import { config } from '../config/index.js';
import { sendMail } from '../libs/nodemailer.js';

const signup = async ({ fullName, email, dni, phone, password }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = 'SELECT * FROM customers WHERE email = $1';
    const { rows: rows1 } = await client.query(query1, [email]);
    const result1 = rows1[0];

    if (result1?.active) throw { statusCode: 409, message: 'EMAIL_IN_USE' };

    const hashedPassword = await bcrypt.hash(password, 10);

    const verifyToken = jwt.sign({ sub: email }, config.verifySecret, { expiresIn: '7d' });

    let query2;
    let result2;

    if (result1) {
      query2 =
        'UPDATE customers SET "fullName" = $1, "dni" = $2, "phone" = $3, "password" = $4 WHERE email = $5 RETURNING *';
      const { rows: rows2 } = await client.query(query2, [fullName, dni, phone, hashedPassword, email]);
      result2 = rows2[0];
    } else {
      query2 =
        'INSERT INTO customers ("fullName", "email", "dni", "phone", "password") VALUES ($1, $2, $3, $4, $5) RETURNING *';
      const { rows: rows2 } = await client.query(query2, [fullName, email, dni, phone, hashedPassword]);
      result2 = rows2[0];
    }

    const domain =
      process.env?.NODE_ENV === 'production'
        ? 'https://green-stone-04b86be10.3.azurestaticapps.net/'
        : 'http://localhost:3000';
    const mail = {
      from: config.smtpEmail,
      to: email,
      subject: 'Verifica tu cuenta',
      html: `<a href="${domain}/verify/${verifyToken}">Haz clic aquí</a>`,
    };
    await sendMail(mail);

    await client.query('COMMIT');
    delete result2.password;
    delete result2.active;
    return result2;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const verify = async ({ verifyToken }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { sub } = jwt.verify(verifyToken, config.verifySecret);

    const query1 = 'UPDATE customers SET active = $1 WHERE email = $2 RETURNING *';
    const { rows: rows1 } = await client.query(query1, [true, sub]);
    console.log(rows1);
    const result1 = rows1[0];

    if (!result1) throw { statusCode: 404, message: 'EMAIL_NOT_FOUND' };

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const login = async ({ email, password }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query = 'SELECT * FROM customers WHERE email = $1';
    const { rows: rows1 } = await client.query(query, [email]);
    const result1 = rows1[0];

    if (!result1) throw { statusCode: 404, message: 'EMAIL_NOT_FOUND' };
    if (!result1.active) throw { statusCode: 401, message: 'USER_NOT_VERIFIED' };

    const isMatch = await bcrypt.compare(password, result1.password);

    if (!isMatch) throw { statusCode: 401, message: 'WRONG_PASSWORD' };

    const accessToken = jwt.sign({ sub: result1.id }, config.accessSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ sub: result1.id }, config.refreshSecret, { expiresIn: '7d' });

    await client.query('COMMIT');

    return { accessToken, refreshToken };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const recoverPassword = async ({ email }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = 'SELECT * FROM customers WHERE email = $1';
    const { rows: rows1 } = await client.query(query1, [email]);
    const result1 = rows1[0];

    if (!result1) throw { statusCode: 404, message: 'EMAIL_NOT_FOUND' };
    if (!result1.active) throw { statusCode: 401, message: 'USER_NOT_VERIFIED' };

    const recoverToken = jwt.sign({ sub: result1.id }, config.verifySecret, { expiresIn: '15m' });

    const domain =
      process.env?.NODE_ENV === 'production'
        ? 'https://green-stone-04b86be10.3.azurestaticapps.net/'
        : 'http://localhost:3000';
    const mail = {
      from: config.smtpEmail,
      to: email,
      subject: 'Actualiza tu contraseña',
      html: `<a href="${domain}/recoverToken/${recoverToken}">Haz clic aquí</a>`,
    };
    await sendMail(mail);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const changePassword = async ({ recoverToken, password }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { sub } = jwt.verify(recoverToken, config.verifySecret);

    const query1 = 'SELECT * FROM customers WHERE id = $1';
    const { rows: rows1 } = await client.query(query1, [sub]);
    const result1 = rows1[0];

    if (!result1) throw { statusCode: 404, message: 'USER_NOT_FOUND' };
    if (!result1.active) throw { statusCode: 401, message: 'USER_NOT_VERIFIED' };

    const hashedPassword = await bcrypt.hash(password, 10);

    const query2 = 'UPDATE customers SET "password" = $1 WHERE id = $2 RETURNING *';
    const { rows: rows2 } = await client.query(query2, [hashedPassword, sub]);
    const result2 = rows2[0];

    if (!result2) throw { statusCode: 500, message: 'PASSWORD_NOT_CHANGED' };

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export default { signup, verify, login, recoverPassword, changePassword };
