import { pool } from '../libs/pg.js';

const getAllOrders = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = `SELECT orders.id, orders."customerId", orders."tableId", orders.total, orders."createdAt",
      JSON_AGG (
        JSON_BUILD_OBJECT (
          'id', dishes_orders.id,
          'dishId', dishes_orders."dishId",
          'quantity', dishes_orders.quantity,
          'details', dishes_orders.details,
          'createdAt', dishes_orders."createdAt"
        )
      ) as dishes_orders FROM orders 
      JOIN dishes_orders ON orders.id = dishes_orders."orderId"
      JOIN dishes ON dishes.id = dishes_orders."dishId" GROUP BY orders.id`;
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

    const query1 = `SELECT orders.id, orders."customerId", orders."tableId", orders.total, orders."createdAt",
    JSON_AGG (
      JSON_BUILD_OBJECT (
        'id', dishes_orders.id,
        'dishId', dishes_orders."dishId",
        'quantity', dishes_orders.quantity,
        'details', dishes_orders.details,
        'createdAt', dishes_orders."createdAt"
      )
    ) as dishes_orders FROM orders 
    JOIN dishes_orders ON orders.id = dishes_orders."orderId"
    JOIN dishes ON dishes.id = dishes_orders."dishId"
    WHERE orders.id = $1 GROUP BY orders.id`;
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
    console.log(customerId);
    const query1 = 'INSERT INTO orders ("customerId", "tableId", "total") VALUES ($1, $2, $3) RETURNING *';
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

export default { getAllOrders, getOneOrder, createNewOrder };