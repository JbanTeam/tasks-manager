import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import routes from './routes/routes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;
const router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(session({ secret: '$ekreT', saveUninitialized: false, resave: false, cookie: { maxAge: 86400 }}));

app.use(morgan('dev'));

app.use('/', routes(router));

function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({ status: 'fail' });
  const error = new Error('Not Found - ' + req.originalUrl);
  next(error);
}

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  res.status(res.statusCode || 500);
  res.json({
    message: err.message,
    stack: err.stack,
  });
}

app.use(notFound);
app.use(errorHandler);

server.listen(port, () => {
  console.log(`API started on localhost: ${port}`);
});
