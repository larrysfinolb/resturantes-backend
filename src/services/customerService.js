import { pool } from '../libs/pg.js';

const getAllCustomers = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = 'SELECT * FROM customers ORDER BY id ASC';
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

const updateOneCustomer = async ({ customerId }, { fullName, dni, phone, isDeleted, email }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = `UPDATE customers SET "fullName" = COALESCE($1, "fullName"), dni = COALESCE($2, dni), 
    phone = COALESCE($3, phone), "isDeleted" = COALESCE($4, "isDeleted"), email = COALESCE($5, email) WHERE id = $6 RETURNING *`;
    const { rows: rows1 } = await client.query(query1, [fullName, dni, phone, isDeleted, email, customerId]);
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

const getAllOrdersByCustomer = async ({ inDebt }, { customerId }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query('BEGIN');

    let query1 = `SELECT orders.*, tables.description as "tableDescription",
      JSON_AGG (
        JSON_BUILD_OBJECT (
          'id', dishes_orders.id,
          'dishId', dishes_orders."dishId",
          'quantity', dishes_orders.quantity,
          'details', dishes_orders.details,
          'createdAt', dishes_orders."createdAt",
          'dish', JSON_BUILD_OBJECT (
            'id', dishes.id,
            'code', dishes.code,
            'name', dishes.name,
            'price', dishes.price,
            'imageUrl', dishes."imageUrl",
            'categoryId', dishes."categoryId",
            'createdAt', dishes."createdAt"
          )
        )
      ) as dishes_orders FROM orders
      JOIN dishes_orders ON orders.id = dishes_orders."orderId" 
      JOIN dishes ON dishes_orders."dishId" = dishes.id 
      JOIN tables ON orders."tableId" = tables.id `;
    query1 +=
      inDebt === 'true'
        ? `WHERE orders."customerId" = $1 AND orders.debt > 0 GROUP BY orders.id, tables.description ORDER BY orders.id ASC`
        : inDebt === 'false'
        ? `WHERE orders."customerId" = $1 AND orders.debt <= 0 GROUP BY orders.id, tables.description ORDER BY orders.id ASC`
        : `WHERE orders."customerId" = $1 GROUP BY orders.id, tables.description ORDER BY orders.id ASC`;

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

const getAllPaymentsByCustomer = async ({ status }, { customerId }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let query1 = `SELECT payments.*, JSON_AGG (
        JSON_BUILD_OBJECT (
          'id', customers.id,
          'fullName', customers."fullName"
        )
      ) as customer FROM payments 
      JOIN orders ON payments."orderId" = orders.id JOIN customers ON orders."customerId" = customers.id `;
    query1 +=
      status === 'pending'
        ? `WHERE orders."customerId" = $1 AND payments.status = 'pending' GROUP BY payments.id ORDER BY payments.id ASC`
        : status === 'approved'
        ? `WHERE orders."customerId" = $1 AND payments.status = 'approved' GROUP BY payments.id ORDER BY payments.id ASC`
        : status === 'rejected'
        ? `WHERE orders."customerId" = $1 AND payments.status = 'rejected' GROUP BY payments.id ORDER BY payments.id ASC`
        : `WHERE orders."customerId" = $1 GROUP BY payments.id ORDER BY payments.id ASC`;

    const { rows: rows1 } = await client.query(query1, [customerId]);
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

export default { getAllCustomers, getOneCustomer, getAllOrdersByCustomer, getAllPaymentsByCustomer, updateOneCustomer };
