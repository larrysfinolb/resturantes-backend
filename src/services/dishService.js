import { pool } from '../libs/pg.js';

const getAllDishes = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = 'SELECT * FROM dishes';
    const { rows: rows1 } = await client.query(query1);
    const result1 = rows1;
    if (result1.length <= 0) throw { statusCode: 404, message: 'DISHES_NOT_FOUND' };

    await client.query('COMMIT');

    return result1;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getOneDish = async ({ dishId }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = 'SELECT * FROM dishes WHERE id = $1';
    const { rows: rows1 } = await client.query(query1, [dishId]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 404, message: 'DISH_NOT_FOUND' };

    await client.query('COMMIT');

    return result1;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const createNewDish = async ({ name, price, imageUrl }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = `INSERT INTO dishes (name, price, "imageUrl") VALUES ($1, $2, $3) RETURNING *`;
    const { rows: rows1 } = await client.query(query1, [name, price, imageUrl]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 500, message: 'DISH_NOT_CREATED' };

    await client.query('COMMIT');

    return result1;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const updateOneDish = async ({ dishId }, { name, price, imageUrl }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 =
      'UPDATE dishes SET name = COALESCE($1, name), price = COALESCE($2, price), "imageUrl" = COALESCE($3, "imageUrl") WHERE id = $4 RETURNING *';
    const { rows: rows1 } = await client.query(query1, [name, price, imageUrl, dishId]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 404, message: 'DISH_NOT_FOUND' };

    await client.query('COMMIT');

    return result1;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const deleteOneDish = async ({ dishId }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = 'DELETE FROM dishes WHERE id = $1 RETURNING *';
    const { rows: rows1 } = await client.query(query1, [dishId]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 404, message: 'DISH_NOT_FOUND' };

    await client.query('COMMIT');

    return result1;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export default { getAllDishes, getOneDish, createNewDish, updateOneDish, deleteOneDish };
