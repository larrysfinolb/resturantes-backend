import { pool } from '../libs/pg.js';

const getAllBanks = async () => {
  const query1 = 'SELECT * FROM banks WHERE "isDeleted" = false ORDER BY id ASC';
  const { rows: rows1 } = await pool.query(query1);
  const result1 = rows1;
  if (result1.length <= 0) throw { statusCode: 404, message: 'BANKS_NOT_FOUND' };

  return result1;
};

const getOneBank = async ({ bankId }) => {
  const query1 = 'SELECT * FROM banks WHERE id = $1 AND "isDeleted" = false';
  const { rows: rows1 } = await pool.query(query1, [bankId]);
  const result1 = rows1[0];
  if (!result1) throw { statusCode: 404, message: 'BANK_NOT_FOUND' };

  return result1;
};

const createNewBank = async ({ name }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = `INSERT INTO banks (name) VALUES ($1) RETURNING *`;
    const { rows: rows1 } = await client.query(query1, [name]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 500, message: 'BANK_NOT_CREATED' };

    await client.query('COMMIT');

    return result1;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updateOneBank = async ({ bankId }, { name }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = `UPDATE banks SET name = COALESCE($1, name) WHERE id = $2 RETURNING *`;
    const { rows: rows1 } = await client.query(query1, [name, bankId]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 500, message: 'BANK_NOT_UPDATED' };

    await client.query('COMMIT');

    return result1;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const deleteOneBank = async ({ bankId }) => {
  const query1 = `UPDATE banks SET "isDeleted" = true WHERE id = $1 RETURNING *`;
  const { rows: rows1 } = await pool.query(query1, [bankId]);
  const result1 = rows1[0];
  if (!result1) throw { statusCode: 404, message: 'BANK_NOT_FOUND' };

  return result1;
};

export default { getAllBanks, getOneBank, createNewBank, updateOneBank, deleteOneBank };
