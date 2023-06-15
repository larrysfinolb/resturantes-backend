import tableService from '../../services/tableService.js';

const tableSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('updateState', (data) => {
      const { tableId, state } = data;

      tableService
        .updateStateTable({ tableId }, { state })
        .then((result) => {
          socket.broadcast.emit('updateState', result);
        })
        .catch((err) => {
          console.log(err);
          if (err?.statusCode) socket.emit('error', err);
          else socket.emit('error', { statusCode: 500, message: err.message });
        });
    });
  });
};

export { tableSocket };
