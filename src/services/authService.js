import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../libs/pg.js';
import { config } from '../config/index.js';
import { sendMail } from '../libs/nodemailer.js';

const signup = async ({ fullName, email, dni, phone, password }) => {
  const client = await pool.connect();

  // FORMATEAR VALORES
  fullName = fullName.trim();
  email = email.toLowerCase().trim();
  dni = dni.trim();
  phone = phone.trim();

  try {
    await client.query('BEGIN');

    // VALIDAR QUE EL EMAIL NO ESTE EN USO
    const query1 = 'SELECT id, active FROM customers WHERE email = $1';
    const { rows: rows1 } = await client.query(query1, [email]);
    const result1 = rows1[0];
    if (result1?.active) throw { statusCode: 409, message: 'EMAIL_IN_USE' };

    // VALIDAR QUE EL DNI NO ESTE EN USO
    const query2 = 'SELECT id, active FROM customers WHERE dni = $1';
    const { rows: rows2 } = await client.query(query2, [dni]);
    const result2 = rows2[0];
    if (result2?.active) throw { statusCode: 409, message: 'DNI_IN_USE' };

    const hashedPassword = await bcrypt.hash(password, 10);

    const verifyToken = jwt.sign({ sub: email }, config.verifySecret, { expiresIn: '7d' });

    let query3;
    let result3;

    if (result1 || result2) {
      const id = result1?.id || result2?.id;
      query3 =
        'UPDATE customers SET "fullName" = $1, "email" = $2, "dni" = $3, "phone" = $4, "password" = $5 WHERE id = $6 RETURNING *';
      const { rows: rows3 } = await client.query(query3, [fullName, email, dni, phone, hashedPassword, id]);
      result3 = rows3[0];
    } else {
      query3 =
        'INSERT INTO customers ("fullName", "email", "dni", "phone", "password") VALUES ($1, $2, $3, $4, $5) RETURNING *';
      const { rows: rows3 } = await client.query(query3, [fullName, email, dni, phone, hashedPassword]);
      result3 = rows3[0];
    }

    const domain =
      process.env?.NODE_ENV === 'production'
        ? 'https://green-stone-04b86be10.3.azurestaticapps.net'
        : 'http://localhost:3000';
    const mail = {
      from: config.smtpEmail,
      to: email,
      subject: 'Verifica tu cuenta',
      html: `<a href="${domain}/login?token=${verifyToken}">Haz clic aquí</a>`,
    };
    await sendMail(mail);

    await client.query('COMMIT');
    delete result3.password;
    delete result3.active;
    return result3;
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

    const { sub } = await jwt.verify(verifyToken, config.verifySecret, (err, decode) => {
      console.log(err);
      if (err) throw { statusCode: 401, message: 'INVALID_TOKEN' };
      return decode;
    });

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

  // FORMATEAR VALORES
  email = email.toLowerCase().trim();

  try {
    await client.query('BEGIN');

    const query = 'SELECT * FROM customers WHERE email = $1';
    const { rows: rows1 } = await client.query(query, [email]);
    const result1 = rows1[0];

    if (!result1) throw { statusCode: 404, message: 'EMAIL_NOT_FOUND' };
    if (!result1.active) throw { statusCode: 401, message: 'USER_NOT_VERIFIED' };

    const isMatch = await bcrypt.compare(password, result1.password);

    if (!isMatch) throw { statusCode: 401, message: 'WRONG_PASSWORD' };

    const accessToken = jwt.sign({ sub: result1.id, role: 'customer' }, config.accessSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ sub: result1.id, role: 'customer' }, config.refreshSecret, { expiresIn: '7d' });

    await client.query('COMMIT');

    return { accessToken, refreshToken };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const refreshToken = async (user) => {
  const accessToken = jwt.sign({ sub: user.id, role: 'customer' }, config.accessSecret, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ sub: user.id, role: 'customer' }, config.refreshSecret, { expiresIn: '7d' });
  return { accessToken, refreshToken };
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
        ? 'https://green-stone-04b86be10.3.azurestaticapps.net'
        : 'http://localhost:3000';
    const mail = {
      from: config.smtpEmail,
      to: email,
      subject: 'Actualiza tu contraseña',
      html: `<a href="${domain}/login?recoverPassword=true&token=${recoverToken}">Haz clic aquí</a>`,
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

export default { signup, verify, login, refreshToken, recoverPassword, changePassword };
