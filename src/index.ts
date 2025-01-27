import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import routes from './routes/routes';
import prisma from './db/prismaClient';
import errorHandler from './middlewares/errors';
import { port } from './constants';

dotenv.config();

const app = express();
const server = http.createServer(app);
const router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('dev'));

app.use('/api', routes(router));

app.use(errorHandler);

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

server.listen(port, () => {
  console.log(`API started on localhost: ${port}`);
});
