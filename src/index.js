import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { errorHandler } from './middlewares/errorHandler.js';
import v1Router from './v1/routes/index.js';
import v1Socket from './v1/sockets/index.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.use('/api/v1', v1Router);
v1Socket('socket/v1', io);

app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
