import { pool } from '../libs/pg.js';
import storageBlob from '../libs/storageBlob.js';

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

const createNewCategory = async ({ name, description }, file) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = `INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *`;
    const { rows: rows1 } = await client.query(query1, [name, description]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 500, message: 'CATEGORY_NOT_CREATED' };

    if (!file) {
      await client.query('COMMIT');
      return result1;
    }

    const imageUrl = await storageBlob.uploadBlob('categories', result1.id, file);
    const query2 = `UPDATE categories SET "imageUrl" = $1 WHERE id = $2 RETURNING *`;
    const { rows: rows2 } = await client.query(query2, [imageUrl, result1.id]);
    const result2 = rows2[0];
    if (!result2) throw { statusCode: 500, message: 'CATEGORY_NOT_CREATED' };

    await client.query('COMMIT');

    return result2;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updateOneCategory = async ({ categoryId }, { name, description }, file) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = `UPDATE categories SET name = COALESCE($1, name), description = COALESCE($2, description) WHERE id = $3 RETURNING *`;
    const { rows: rows1 } = await client.query(query1, [name, description, categoryId]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 404, message: 'CATEGORY_NOT_FOUND' };

    if (!file) {
      await client.query('COMMIT');
      return result1;
    }

    if (result1.imageUrl) {
      const blobName = result1.imageUrl.split('/').pop();
      await storageBlob.deleteBlob('categories', blobName);
    }

    const imageUrl = await storageBlob.uploadBlob('categories', result1.id, file);
    const query2 = `UPDATE categories SET "imageUrl" = $1 WHERE id = $2 RETURNING *`;
    const { rows: rows2 } = await client.query(query2, [imageUrl, result1.id]);
    const result2 = rows2[0];
    if (!result2) throw { statusCode: 500, message: 'CATEGORY_NOT_UPDATED' };

    await client.query('COMMIT');

    return result2;
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

    if (result1.imageUrl) {
      const blobName = result1.imageUrl.split('/').pop();
      await storageBlob.deleteBlob('categories', blobName);
    }

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
  const query1 = `SELECT dishes.*, categories.name as "categoryName" FROM dishes 
    JOIN categories ON categories.id = dishes."categoryId" 
    WHERE "categoryId" = $1`;
  const { rows: rows1 } = await pool.query(query1, [categoryId]);
  const result1 = rows1;
  if (result1.length <= 0) throw { statusCode: 404, message: 'DISHES_NOT_FOUND' };
  return result1;
};

export default {
  getAllCategories,
  getOneCategory,
  createNewCategory,
  updateOneCategory,
  deleteOneCategory,
  getAllDishesByCategory,
};
