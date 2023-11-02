import { config } from '../config/index.js';
import { sendMail } from '../libs/nodemailer.js';
import { pool } from '../libs/pg.js';
import storageBlob from '../libs/storageBlob.js';
import { verifiedPaymentTemplate } from '../utils/templates/verifiedPayment.js';

const getAllPayments = async ({ status }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let query1 = `SELECT payments.*, JSON_AGG (
      JSON_BUILD_OBJECT (
        'id', customers.id,
        'fullName', customers."fullName",
        'dni', customers.dni
      )
    ) as customer FROM payments 
    JOIN orders ON payments."orderId" = orders.id JOIN customers ON orders."customerId" = customers.id `;
    query1 +=
      status === 'pending'
        ? `WHERE payments.status = 'pending' GROUP BY payments.id ORDER BY payments.id ASC`
        : status === 'approved'
        ? `WHERE payments.status = 'approved' GROUP BY payments.id ORDER BY payments.id ASC`
        : status === 'rejected'
        ? `WHERE payments.status = 'rejected' GROUP BY payments.id ORDER BY payments.id ASC`
        : 'GROUP BY payments.id';
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

    const query1 = `SELECT payments.*, JSON_AGG (
      JSON_BUILD_OBJECT (
        'id', customers.id,
        'fullName', customers."fullName",
        'dni', customers.dni
      )
    ) as customer FROM payments 
    JOIN orders ON payments."orderId" = orders.id JOIN customers ON orders."customerId" = customers.id 
    WHERE payments.id = $1 GROUP BY payments.id`;
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

const createNewPayment = async ({ orderId, reference, dni, type, amount, bankId }, file) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = `INSERT INTO payments ("orderId", reference, dni, type, amount, "bankId") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const { rows: rows1 } = await client.query(query1, [orderId, reference, dni, type, amount, bankId]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 500, message: 'PAYMENT_NOT_CREATED' };

    if (!file) {
      await client.query('COMMIT');
      return result1;
    }

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

const updateOnePayment = async ({ paymentId }, { status, message }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query0 = `SELECT payments.*, customers.email as "customerEmail" 
    FROM payments 
    JOIN orders ON payments."orderId" = orders.id JOIN customers ON orders."customerId" = customers.id
    WHERE payments.id = $1 GROUP BY payments.id, customers.email`;
    const { rows: rows0 } = await client.query(query0, [paymentId]);
    const result0 = rows0[0];
    if (!result0) throw { statusCode: 404, message: 'PAYMENT_NOT_FOUND' };
    if (result0.status !== 'pending') throw { statusCode: 400, message: 'PAYMENT_NOT_PENDING' };

    const query1 = `UPDATE payments SET status = COALESCE($1, status), message = COALESCE($2, message) WHERE id = $3 RETURNING *`;
    const { rows: rows1 } = await client.query(query1, [status, message, paymentId]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 500, message: 'PAYMENT_NOT_UPDATED' };

    if (result1.status === 'approved') {
      const query2 = `SELECT * FROM orders WHERE id = $1`;
      const { rows: rows2 } = await client.query(query2, [result1.orderId]);
      const result2 = rows2[0];
      if (!result2) throw { statusCode: 404, message: 'ORDER_NOT_FOUND' };

      const newDebt = result2.debt - result1.amount;
      const query3 = `UPDATE orders SET debt = $1 WHERE id = $2 RETURNING *`;
      const { rows: rows3 } = await client.query(query3, [newDebt, result1.orderId]);
      const result3 = rows3[0];
      if (!result3) throw { statusCode: 500, message: 'ORDER_NOT_UPDATED' };
    }

    const details = {
      date: result1.createdAt.toISOString().split('T')[0],
      dni: result1.dni,
      amount: result1.amount,
      type: result1.type === 'cash' ? 'Efectivo' : result1.type === 'transfer' ? 'Transferencia' : 'Tarjeta',
    };

    const subject = status === 'approved' ? 'Tu pago a sido aprobado' : 'Tu pago a sido rechazado';
    const mail = {
      from: config.smtpEmail,
      to: result0.customerEmail,
      subject,
      html: verifiedPaymentTemplate(result1.status, result1.message, details),
    };
    await sendMail(mail);

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
