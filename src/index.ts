import dotenv from 'dotenv';
import http from 'http';
import morgan from 'morgan';
import express from 'express';
import bodyParser from 'body-parser';

import { port } from './constants';
import routes from './routes/routes';
import prisma from './db/prismaClient';
import errorHandler from './middlewares/errors';

dotenv.config();

const app = express();
const server = http.createServer(app);
const router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('dev'));

app.use('/api', routes(router));

app.use(errorHandler);

process.on('SIGINT', () => {
  (async () => {
    await prisma.$disconnect();
    process.exit(0);
  })();
});

server.listen(port, () => {
  console.log(`API started on localhost: ${port}`);
});

export { server };
