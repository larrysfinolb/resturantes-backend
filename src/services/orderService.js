import { pool } from '../libs/pg.js';

const getAllOrders = async ({ inDebt }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let query1 = `SELECT orders.*, tables.description as "tableDescription",
      JSON_AGG (
        JSON_BUILD_OBJECT (
          'id', dishes_orders.id,
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
      ) as dishes_orders,
      JSON_BUILD_OBJECT (
        'id', customers.id,
        'fullName', customers."fullName",
        'dni', customers.dni
      ) as customer FROM orders 
      JOIN dishes_orders ON orders.id = dishes_orders."orderId" 
      JOIN dishes ON dishes_orders."dishId" = dishes.id 
      JOIN customers ON orders."customerId" = customers.id 
      JOIN tables ON orders."tableId" = tables.id `;
    query1 +=
      inDebt === 'true'
        ? `WHERE orders.debt > 0 GROUP BY orders.id, customers.id, tables.description ORDER BY orders.id ASC`
        : inDebt === 'false'
        ? `WHERE orders.debt <= 0 GROUP BY orders.id, customers.id, tables.description ORDER BY orders.id ASC`
        : `GROUP BY orders.id, customers.id, tables.description ORDER BY orders.id ASC`;

    const { rows: rows1 } = await client.query(query1);
    const result1 = rows1;
    if (result1.length <= 0) throw { statusCode: 404, message: 'ORDERS_NOT_FOUND' };

    await client.query('COMMIT');

    return result1;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getOneOrder = async ({ orderId }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = `SELECT orders.*, tables.description as "tableDescription",
      JSON_AGG (
        JSON_BUILD_OBJECT (
          'id', dishes_orders.id,
          'quantity', dishes_orders.quantity,
          'details', dishes_orders.details,
          'createdAt', dishes_orders."createdAt",
          'dish', JSON_BUILD_OBJECT (
            'id', dishes.id,
            'name', dishes.name,
            'code', dishes.code,
            'price', dishes.price,
            'imageUrl', dishes."imageUrl",
            'categoryId', dishes."categoryId",
            'createdAt', dishes."createdAt"
          )
        )
      ) as dishes_orders,
      JSON_BUILD_OBJECT (
        'id', customers.id,
        'fullName', customers."fullName",
        'dni', customers.dni
      ) as customer FROM orders 
      JOIN dishes_orders ON orders.id = dishes_orders."orderId" 
      JOIN dishes ON dishes_orders."dishId" = dishes.id 
      JOIN customers ON orders."customerId" = customers.id
      JOIN tables ON orders."tableId" = tables.id
      WHERE orders.id = $1 GROUP BY orders.id, customers.id, tables.description`;
    const { rows: rows1 } = await client.query(query1, [orderId]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 404, message: 'ORDER_NOT_FOUND' };

    await client.query('COMMIT');

    return result1;
  } catch (err) {
    await pool.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const createNewOrder = async ({ customerId }, { tableId, dishes }) => {
  const client = await pool.connect();

  try {
    await pool.query('BEGIN');

    const totals = await Promise.all(
      dishes.map(async (dish) => {
        const query = 'SELECT price FROM dishes WHERE id = $1';
        const { rows } = await client.query(query, [dish.id]);
        const result = rows[0];
        if (!result) throw { statusCode: 404, message: 'DISH_NOT_FOUND' };
        return result.price * dish.quantity;
      })
    );

    const query1 = 'INSERT INTO orders ("customerId", "tableId", "total", "debt") VALUES ($1, $2, $3, $3) RETURNING *';
    const { rows: rows1 } = await client.query(query1, [customerId, tableId, totals.reduce((a, b) => a + b, 0)]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 500, message: 'ORDER_NOT_CREATED' };
    const order = result1;

    const dishesOrders = await Promise.all(
      dishes.map(async (dish) => {
        const query2 =
          'INSERT INTO dishes_orders ("dishId", "orderId", "quantity", "details") VALUES ($1, $2, $3, $4) RETURNING *';
        const { rows: rows2 } = await client.query(query2, [dish.id, order.id, dish.quantity, dish.details]);
        const result2 = rows2[0];
        if (!result2) throw { statusCode: 500, message: 'DISH_ORDER_NOT_CREATED' };
        return result2;
      })
    );

    await pool.query('COMMIT');

    return {
      ...order,
      dishes: dishesOrders.map((dish) => {
        delete dish.orderId;
        return dish;
      }),
    };
  } catch (err) {
    await pool.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const updateStatusOrder = async ({ orderId }, { status, message }) => {
  const client = await pool.connect();

  try {
    await pool.query('BEGIN');

    const query1 =
      'UPDATE orders SET status = COALESCE($1, status), message = COALESCE($2, message) WHERE id = $3 RETURNING *';
    const { rows: rows1 } = await client.query(query1, [status, message, orderId]);
    const result1 = rows1[0];
    if (!result1) throw { statusCode: 500, message: 'ORDER_STATUS_NOT_UPDATED' };

    await pool.query('COMMIT');

    return result1;
  } catch (err) {
    await pool.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export default { getAllOrders, getOneOrder, createNewOrder, updateStatusOrder };
