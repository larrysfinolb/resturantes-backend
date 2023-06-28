import { pool } from '../libs/pg.js';

const getAllCategories = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = 'SELECT * FROM categories';
    const { rows: rows1 } = await client.query(query1);
    const result1 = rows1;
    if (result1.length <= 0) throw { statusCode: 404, message: 'CATEGORIES_NOT_FOUND' };

    await client.query('COMMIT');

    return result1;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getOneCategory = async ({ categoryId }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = 'SELECT * FROM categories WHERE id = $1';
    const { rows: rows1 } = await client.query(query1, [categoryId]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 404, message: 'CATEGORY_NOT_FOUND' };

    await client.query('COMMIT');

    return result1;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const createNewCategory = async ({ name, description, imageUrl }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = `INSERT INTO categories (name, description, "imageUrl") VALUES ($1, $2, $3) RETURNING *`;
    const { rows: rows1 } = await client.query(query1, [name, description, imageUrl]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 500, message: 'CATEGORY_NOT_CREATED' };

    await client.query('COMMIT');

    return result1;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updateOneCategory = async ({ categoryId }, { name, description, imageUrl }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = `UPDATE categories SET name = COALESCE($1, name), description = COALESCE($2, description), "imageUrl" = COALESCE($3, "imageUrl") WHERE id = $4 RETURNING *`;
    const { rows: rows1 } = await client.query(query1, [name, description, imageUrl, categoryId]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 404, message: 'CATEGORY_NOT_FOUND' };

    await client.query('COMMIT');

    return result1;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const deleteOneCategory = async ({ categoryId }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = `DELETE FROM categories WHERE id = $1 RETURNING *`;
    const { rows: rows1 } = await client.query(query1, [categoryId]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 404, message: 'CATEGORY_NOT_FOUND' };

    await client.query('COMMIT');

    return result1;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getAllDishesByCategory = async ({ categoryId }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = 'SELECT * FROM dishes WHERE "categoryId" = $1';
    const { rows: rows1 } = await client.query(query1, [categoryId]);
    const result1 = rows1;
    if (result1.length <= 0) throw { statusCode: 404, message: 'DISHES_NOT_FOUND' };

    await client.query('COMMIT');

    return result1;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default {
  getAllCategories,
  getOneCategory,
  createNewCategory,
  updateOneCategory,
  deleteOneCategory,
  getAllDishesByCategory,
};
