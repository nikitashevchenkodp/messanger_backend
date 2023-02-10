require('dotenv').config();
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { chatsRouter, messageRouter, userRouter } from './routes';

mongoose.set('strictQuery', false);

const app: Express = express();
const port = process.env.APP_PORT || 5003;
app.use(cors());
app.use(express.json());
app.use('/api/users', userRouter);
app.use('/api/chats', chatsRouter);
app.use('/api/messages', messageRouter);

const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URL!);
    app.listen(port, () => console.log(`Server started on ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
