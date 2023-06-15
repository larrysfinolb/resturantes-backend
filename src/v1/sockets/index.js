import { tableSocket } from './tableSocket.js';

const v1Socket = (route, io) => {
  const tableNamespace = io.of(`${route}/table`);
  tableSocket(tableNamespace);
};

export default v1Socket;
