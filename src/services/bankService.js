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

const createNewBank = async ({ name, number, dni }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = `SELECT * FROM banks WHERE number = $1 AND "isDeleted" = false`;
    const { rows: rows1 } = await client.query(query1, [number]);
    const result1 = rows1[0];
    if (result1) throw { statusCode: 400, message: 'BANK_ALREADY_EXISTS' };

    const query2 = `INSERT INTO banks (name, number, dni) VALUES ($1, $2, $3) RETURNING *`;
    const { rows: rows2 } = await client.query(query2, [name, number, dni]);
    const result2 = rows2[0];
    if (!result2) throw { statusCode: 500, message: 'BANK_NOT_CREATED' };

    await client.query('COMMIT');

    return result2;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updateOneBank = async ({ bankId }, { name, number, dni }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = `SELECT * FROM banks WHERE number = $1 AND "isDeleted" = false`;
    const { rows: rows1 } = await client.query(query1, [number]);
    const result1 = rows1[0];
    if (result1) throw { statusCode: 400, message: 'BANK_ALREADY_EXISTS' };

    const query2 = `UPDATE banks SET name = COALESCE($1, name), number = COALESCE($2, number), dni = COALESCE($3, dni) WHERE id = $4 RETURNING *`;
    const { rows: rows2 } = await client.query(query2, [name, number, dni, bankId]);
    const result2 = rows2[0];
    if (!result2) throw { statusCode: 500, message: 'BANK_NOT_UPDATED' };

    await client.query('COMMIT');

    return result2;
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
