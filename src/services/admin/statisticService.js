import { pool } from '../../libs/pg.js';

const getAll = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query1 = `SELECT * FROM orders`;
    const { rows: rows1 } = await client.query(query1);
    const result1 = rows1;

    const MONTHS = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    const numberOrders = {
      labels: MONTHS,
      data: MONTHS.map((_, i) => result1.filter((order) => order.createdAt.getMonth() === i).length),
    };
    const totalOrders = {
      labels: MONTHS,
      data: MONTHS.map((_, i) =>
        result1.filter((order) => order.createdAt.getMonth() === i).reduce((acc, curr) => acc + curr.total, 0)
      ),
    };

    const query2 = `SELECT * FROM tables`;
    const { rows: result2 } = await client.query(query2);

    const frequentTables = {
      labels: result2.map((table) => table.description),
      data: result2.map((table) => result1.filter((order) => order.tableId === table.id).length),
    };

    const query3 = `SELECT dishes_orders.*, dishes.name AS "dishName" FROM dishes_orders 
    JOIN dishes ON dishes_orders."dishId" = dishes.id`;
    const { rows: result3 } = await client.query(query3);

    const popularDishes = {
      labels: result3.map((dish) => dish.dishName),
      data: result3.map((dish) => result1.filter((order) => order.id === dish.orderId).length * dish.quantity),
    };
    popularDishes.data.sort((a, b) => b - a);
    popularDishes.labels.sort(
      (a, b) =>
        popularDishes.data[popularDishes.labels.indexOf(b)] - popularDishes.data[popularDishes.labels.indexOf(a)]
    );
    popularDishes.data = popularDishes.data.slice(0, 5);
    popularDishes.labels = popularDishes.labels.slice(0, 5);

    await client.query('COMMIT');

    return {
      numberOrders,
      totalOrders,
      frequentTables,
      popularDishes,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default { getAll };
