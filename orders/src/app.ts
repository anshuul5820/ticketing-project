import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';

import { json } from 'body-parser';
import {
  currentUser,
  errorHandler, NotFoundError
} from '@ticketing-common-lib05/common';
import { deleteOrderRouter } from './routes/delete';
import { newOrderRouter } from './routes/new';
import { indexOrderRouter } from './routes';
import { showOrderRouter } from './routes/show';
import { body } from 'express-validator';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
  })
);
app.use(currentUser)//checks if user is authenticated

app.use(deleteOrderRouter)
app.use(newOrderRouter)
app.use(indexOrderRouter)
app.use(showOrderRouter)

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
