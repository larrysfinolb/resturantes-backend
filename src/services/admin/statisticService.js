import { pool } from '../../libs/pg.js';

const getAll = async ({ year }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    year = year ?? new Date().getFullYear();

    const query1 = `SELECT * FROM orders WHERE status = 'delivered'`;
    const { rows: rows1 } = await client.query(query1);
    const result1 = rows1;

    const MONTHS = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    const numberOrders = {
      labels: MONTHS,
      data: MONTHS.map(
        (_, i) =>
          result1.filter((order) => order.createdAt.getMonth() === i && order.createdAt.getFullYear() === year).length
      ),
    };
    const totalOrders = {
      labels: MONTHS,
      data: MONTHS.map((_, i) =>
        result1
          .filter((order) => order.createdAt.getMonth() === i && order.createdAt.getFullYear() === year)
          .reduce((acc, curr) => acc + curr.total, 0)
      ),
    };

    const query2 = `SELECT tables.id, tables.description, orders."createdAt"
    FROM orders 
    JOIN tables ON orders."tableId" = tables.id
    WHERE orders.status = 'delivered'`;
    const { rows: result2 } = await client.query(query2);

    // Contar la cantidad de veces que se repite cada mesa y convertimos el objeto en un array
    const tablesArray = Object.values(
      result2.reduce((acc, curr) => {
        if (acc[curr.id]) {
          acc[curr.id].quantity += 1;
        } else {
          acc[curr.id] = { ...curr, quantity: 1 };
        }
        return acc;
      }, {})
    );
    // Ordenamos el array por las mesas más frecuentes
    tablesArray.sort((a, b) => b.quantity - a.quantity);
    // Convertimos el array en un objeto con las propiedades labels y data
    const frequentTables = {
      labels: tablesArray.filter((table) => table.createdAt.getFullYear() === year).map((table) => table.description),
      data: tablesArray.filter((table) => table.createdAt.getFullYear() === year).map((table) => table.quantity),
    };

    const query3 = `SELECT dishes_orders."orderId", dishes_orders.quantity, dishes.name AS "dishName", dishes.id AS "dishId", orders."createdAt"
    FROM dishes_orders 
    JOIN orders ON dishes_orders."orderId" = orders.id
    JOIN dishes ON dishes_orders."dishId" = dishes.id
    WHERE orders.status = 'delivered'`;
    const { rows: result3 } = await client.query(query3);

    // Los platos que se repiten acumularán la cantidad de veces que se repiten y convertimos el objeto en un array
    const dishesArray = Object.values(
      result3.reduce((acc, curr) => {
        if (acc[curr.dishId]) {
          acc[curr.dishId].quantity += curr.quantity;
        } else {
          acc[curr.dishId] = curr;
        }
        return acc;
      }, {})
    );
    // Ordenamos el array por los platos más pedidos
    dishesArray.sort((a, b) => b.quantity - a.quantity);
    // Nos quedamos con los 5 platos más pedidos
    dishesArray.length = 5;
    // Convertimos el array en un objeto con las propiedades labels y data
    const popularDishes = {
      labels: dishesArray.filter((dish) => dish.createdAt.getFullYear() === year).map((dish) => dish.dishName),
      data: dishesArray.filter((dish) => dish.createdAt.getFullYear() === year).map((dish) => dish.quantity),
    };

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
