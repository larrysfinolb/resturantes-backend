import { pool } from '../libs/pg.js';
import storageBlob from '../libs/storageBlob.js';

const getAllCategories = async () => {
  const query1 = 'SELECT * FROM categories WHERE "isDeleted" = false ORDER BY id ASC';
  const { rows: rows1 } = await pool.query(query1);
  const result1 = rows1;
  if (result1.length <= 0) throw { statusCode: 404, message: 'CATEGORIES_NOT_FOUND' };

  return result1;
};

const getOneCategory = async ({ categoryId }) => {
  const query1 = 'SELECT * FROM categories WHERE id = $1 AND "isDeleted" = false';
  const { rows: rows1 } = await pool.query(query1, [categoryId]);
  const result1 = rows1[0];
  if (!result1) throw { statusCode: 404, message: 'CATEGORY_NOT_FOUND' };

  return result1;
};

const createNewCategory = async ({ name }, file) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = `INSERT INTO categories (name) VALUES ($1) RETURNING *`;
    const { rows: rows1 } = await client.query(query1, [name]);
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

const updateOneCategory = async ({ categoryId }, { name }, file) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = `UPDATE categories SET name = COALESCE($1, name) WHERE id = $2 RETURNING *`;
    const { rows: rows1 } = await client.query(query1, [name, categoryId]);
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

    const query1 = `UPDATE categories SET "isDeleted" = true WHERE id = $1 RETURNING *`;
    const { rows: rows1 } = await client.query(query1, [categoryId]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 404, message: 'CATEGORY_NOT_FOUND' };

    const query2 = `UPDATE dishes SET "categoryId" = null WHERE "categoryId" = $1 RETURNING *`;
    const { rows: rows2 } = await client.query(query2, [categoryId]);
    const result2 = rows2;
    if (!result2) throw { statusCode: 500, message: 'CATEGORY_NOT_DELETED' };

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
    WHERE dishes."categoryId" = $1 AND dishes."isDeleted" = false AND categories."isDeleted" = false ORDER BY dishes.id ASC`;
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
