import jwt from 'jsonwebtoken';
import { pool } from '../libs/pg.js';
import { config } from '../config/index.js';

const getAllTables = async () => {
  const query = 'SELECT * FROM tables';
  const { rows } = await pool.query(query);
  return rows;
};

const getOneTable = async ({ tableId }) => {
  const query = 'SELECT * FROM tables WHERE id = $1';
  const { rows } = await pool.query(query, [tableId]);
  const result = rows[0];

  if (!result) throw { statusCode: 400, statusMessage: 'Not found', message: 'Table not found' };

  return result;
};

const createNewTable = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const query1 = 'INSERT INTO tables (qr_token) VALUES ($1) RETURNING *';
    const { rows: rows1 } = await client.query(query1, [null]);
    const result1 = rows1[0];

    if (!result1.id) throw { statusCode: 406, statusMessage: 'Not acceptable', message: 'Table not created' };

    const payload = {
      sub: result1.id,
    };
    const qrToken = jwt.sign(payload, config.qrToken);

    const query2 = 'UPDATE tables SET qr_token = $1 WHERE id = $2 RETURNING *';
    const { rows: rows2 } = await client.query(query2, [qrToken, result1.id]);
    const result2 = rows2[0];

    if (!result2) throw { statusCode: 406, statusMessage: 'Not acceptable', message: 'Table not created' };

    await client.query('COMMIT');
    return rows2;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const updateOneTable = async ({ tableId }) => {
  return {};
};

const deleteOneTable = async ({ tableId }) => {
  const query = 'DELETE FROM tables WHERE id = $1 RETURNING *';
  const { rows } = await pool.query(query, [tableId]);
  const result = rows[0];

  if (!result) throw { statusCode: 404, statusMessage: 'Not found', message: 'Table not found' };

  return result;
};

export default { getAllTables, getOneTable, createNewTable, updateOneTable, deleteOneTable };
