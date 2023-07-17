import { pool } from '../libs/pg.js';

const getAllCustomers = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = 'SELECT * FROM customers';
    const { rows: rows1 } = await client.query(query1);
    const result1 = rows1;
    if (result1.length <= 0) throw { statusCode: 404, message: 'CUSTOMERS_NOT_FOUND' };

    await client.query('COMMIT');

    const customers = result1.map((customer) => {
      delete customer.password;
      return customer;
    });

    return customers;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getOneCustomer = async ({ customerId }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = 'SELECT * FROM customers WHERE id = $1';
    const { rows: rows1 } = await client.query(query1, [customerId]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 404, message: 'CUSTOMER_NOT_FOUND' };

    await client.query('COMMIT');

    delete result1.password;

    return result1;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getAllOrdersByCustomer = async ({ customerId }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = 'SELECT * FROM orders WHERE "customerId" = $1';
    const { rows: rows1 } = await client.query(query1, [customerId]);
    const result1 = rows1;
    if (result1.length <= 0) throw { statusCode: 404, message: 'ORDERS_NOT_FOUND' };

    await client.query('COMMIT');

    return result1;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default { getAllCustomers, getOneCustomer, getAllOrdersByCustomer };
