import { pool } from '../libs/pg.js';
import storageBlob from '../libs/storageBlob.js';

const getAllPayments = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = 'SELECT * FROM payments';
    const { rows: rows1 } = await client.query(query1);
    const result1 = rows1;
    if (result1.length <= 0) throw { statusCode: 404, message: 'PAYMENTS_NOT_FOUND' };

    await client.query('COMMIT');

    return result1;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getOnePayment = async ({ paymentId }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = 'SELECT * FROM payments WHERE id = $1';
    const { rows: rows1 } = await client.query(query1, [paymentId]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 404, message: 'PAYMENT_NOT_FOUND' };

    await client.query('COMMIT');

    return result1;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const createNewPayment = async ({ orderId, reference, dni }, file) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (!file) throw { statusCode: 400, message: 'INVALID_DATA' };

    const query1 = `INSERT INTO payments ("orderId", reference, dni) VALUES ($1, $2, $3) RETURNING *`;
    const { rows: rows1 } = await client.query(query1, [orderId, reference, dni]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 500, message: 'PAYMENT_NOT_CREATED' };

    const voucherUrl = await storageBlob.uploadBlob('payments', result1.id, file);
    const query2 = `UPDATE payments SET "voucherUrl" = $1 WHERE id = $2 RETURNING *`;
    const { rows: rows2 } = await client.query(query2, [voucherUrl, result1.id]);
    const result2 = rows2[0];
    if (!result2) throw { statusCode: 500, message: 'PAYMENT_NOT_CREATED' };

    await client.query('COMMIT');

    return result2;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updateOnePayment = async ({ paymentId }, { status }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = `UPDATE payments SET status = $1 WHERE id = $2 RETURNING *`;
    const { rows: rows1 } = await client.query(query1, [status, paymentId]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 500, message: 'PAYMENT_NOT_UPDATED' };

    await client.query('COMMIT');

    return result1;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default { getAllPayments, getOnePayment, createNewPayment, updateOnePayment };
