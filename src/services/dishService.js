import { pool } from '../libs/pg.js';
import storageBlob from '../libs/storageBlob.js';

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

const createNewDish = async ({ name, price, categoryId }, file) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = `INSERT INTO dishes (name, price, "categoryId") VALUES ($1, $2, $3) RETURNING *`;
    const { rows: rows1 } = await client.query(query1, [name, price, categoryId]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 500, message: 'DISH_NOT_CREATED' };

    if (!file) {
      await client.query('COMMIT');
      return result1;
    }

    const imageUrl = await storageBlob.uploadBlob('dishes', result1.id, file);
    const query2 = `UPDATE dishes SET "imageUrl" = $1 WHERE id = $2 RETURNING *`;
    const { rows: rows2 } = await client.query(query2, [imageUrl, result1.id]);
    const result2 = rows2[0];
    if (!result2) throw { statusCode: 500, message: 'DISH_NOT_CREATED' };

    await client.query('COMMIT');

    return result2;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const updateOneDish = async ({ dishId }, { name, price, categoryId }, file) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 =
      'UPDATE dishes SET name = COALESCE($1, name), price = COALESCE($2, price), "categoryId" = COALESCE($3, "categoryId") WHERE id = $4 RETURNING *';
    const { rows: rows1 } = await client.query(query1, [name, price, categoryId, dishId]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 404, message: 'DISH_NOT_FOUND' };

    if (!file) {
      await client.query('COMMIT');
      return result1;
    }

    if (result1.imageUrl) {
      const blobName = result1.imageUrl.split('/').pop();
      await storageBlob.deleteBlob('dishes', blobName);
    }

    const imageUrl = await storageBlob.uploadBlob('dishes', result1.id, file);
    const query2 = `UPDATE dishes SET "imageUrl" = $1 WHERE id = $2 RETURNING *`;
    const { rows: rows2 } = await client.query(query2, [imageUrl, result1.id]);
    const result2 = rows2[0];
    if (!result2) throw { statusCode: 500, message: 'DISH_NOT_CREATED' };

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

    if (result1.imageUrl) {
      const blobName = result1.imageUrl.split('/').pop();
      await storageBlob.deleteBlob('dishes', blobName);
    }

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
