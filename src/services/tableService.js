import { pool } from '../libs/pg.js';

const getAllTables = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = 'SELECT * FROM tables';
    const { rows: rows1 } = await client.query(query1);
    const result1 = rows1;
    if (result1.length <= 0) throw { statusCode: 404, message: 'TABLES_NOT_FOUND' };

    await client.query('COMMIT');

    return result1;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getOneTable = async ({ tableId }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = 'SELECT * FROM tables WHERE id = $1';
    const { rows: rows1 } = await client.query(query1, [tableId]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 404, message: 'TABLE_NOT_FOUND' };

    await client.query('COMMIT');

    return result1;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const updateStateTable = async ({ tableId }, { state }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = 'UPDATE tables SET state = $1 WHERE id = $2 RETURNING *';
    const { rows: rows1 } = await client.query(query1, [state, tableId]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 404, message: 'TABLE_NOT_FOUND' };

    await client.query('COMMIT');

    return result1;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const createNewTable = async ({ description }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const query1 = 'INSERT INTO tables (description) VALUES ($1) RETURNING *';
    const { rows: rows1 } = await client.query(query1, [description]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 500, message: 'TABLE_NOT_CREATED' };

    await client.query('COMMIT');

    return result1;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const updateOneTable = async ({ tableId }, { description }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = 'UPDATE tables SET description = $1 WHERE id = $2 RETURNING *';
    const { rows: rows1 } = await client.query(query1, [description, tableId]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 404, message: 'TABLE_NOT_FOUND' };

    await client.query('COMMIT');

    return result1;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const deleteOneTable = async ({ tableId }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = 'DELETE FROM tables WHERE id = $1 RETURNING *';
    const { rows: rows1 } = await client.query(query1, [tableId]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 404, message: 'TABLE_NOT_FOUND' };

    await client.query('COMMIT');

    return result1;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export default { getAllTables, getOneTable, updateStateTable, createNewTable, updateOneTable, deleteOneTable };
