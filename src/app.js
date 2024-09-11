import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import UsersRouter from '../routers/user.router.js';
import CharacterRouter from '../routers/character.router.js';
import ItemRouter from '../routers/Item.router.js';

import LogMiddleware from '../middlewares/log.middleware.js';
import ErrorHandingMiddleware from '../middlewares/errorhanding.middleware.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(LogMiddleware);
app.use(express.json());
app.use(cookieParser());

app.use('/api', [UsersRouter, CharacterRouter, ItemRouter]);

app.use(ErrorHandingMiddleware);
app.listen(PORT, () => {
  console.log(PORT + '로 서버가 열렸습니다');
});
