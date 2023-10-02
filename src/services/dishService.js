import { pool } from '../libs/pg.js';
import storageBlob from '../libs/storageBlob.js';

const getAllDishes = async ({ haveCategory, active }) => {
  try {
    const query1 =
      haveCategory === 'true'
        ? `SELECT dishes.*, categories.name as "categoryName" FROM dishes LEFT JOIN categories ON dishes."categoryId" = categories.id WHERE dishes."isDeleted" = false AND dishes."categoryId" IS NOT NULL ORDER BY dishes.id ASC`
        : haveCategory === 'false'
        ? `SELECT dishes.*, categories.name as "categoryName" FROM dishes LEFT JOIN categories ON dishes."categoryId" = categories.id WHERE dishes."isDeleted" = false AND dishes."categoryId" IS NULL ORDER BY dishes.id ASC`
        : `SELECT dishes.*, categories.name as "categoryName" FROM dishes LEFT JOIN categories ON dishes."categoryId" = categories.id WHERE dishes."isDeleted" = false ORDER BY dishes.id ASC`;
    const { rows: rows1 } = await pool.query(query1);
    let result1 = rows1;
    if (active === 'true') result1 = result1.filter((dish) => dish.active === true);
    else if (active === 'false') result1 = result1.filter((dish) => dish.active === false);

    if (result1.length <= 0) throw { statusCode: 404, message: 'DISHES_NOT_FOUND' };

    return result1;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getOneDish = async ({ dishId }) => {
  const query1 = 'SELECT * FROM dishes WHERE id = $1 AND "isDeleted" = false';
  const { rows: rows1 } = await pool.query(query1, [dishId]);
  const result1 = rows1[0];
  if (!result1) throw { statusCode: 404, message: 'DISH_NOT_FOUND' };

  return result1;
};

const createNewDish = async ({ name, price, description, categoryId }, file) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = `INSERT INTO dishes (name, price, description, "categoryId") VALUES ($1, $2, $3, $4) RETURNING *`;
    const { rows: rows1 } = await client.query(query1, [name, price, description, categoryId]);
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

const updateOneDish = async ({ dishId }, { name, price, description, categoryId, active }, file) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = `UPDATE dishes SET name = COALESCE($1, name), price = COALESCE($2, price), description = COALESCE($3, description),
    "categoryId" = COALESCE($4, "categoryId"), active = COALESCE($5, active) WHERE id = $6 RETURNING *`;
    const { rows: rows1 } = await client.query(query1, [name, price, description, categoryId, active, dishId]);
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
  const query1 = `UPDATE dishes SET "isDeleted" = true WHERE id = $1 RETURNING *`;
  const { rows: rows1 } = await pool.query(query1, [dishId]);
  const result1 = rows1[0];
  if (!result1) throw { statusCode: 404, message: 'DISH_NOT_FOUND' };

  if (result1.imageUrl) {
    const blobName = result1.imageUrl.split('/').pop();
    await storageBlob.deleteBlob('dishes', blobName);
  }

  return result1;
};

export default { getAllDishes, getOneDish, createNewDish, updateOneDish, deleteOneDish };
