require('dotenv').config();
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { chatsRouter, messageRouter, userRouter } from './routes';
import { ServerSocket } from './socket';
import Chat from './schemas/Chat';
import { errorMiddleware } from './middlewares/error-middleware';
import authMiddleware from './middlewares/auth-middleware';
import cookieParser from 'cookie-parser';
mongoose.set('strictQuery', false);

const app: Express = express();
const port = parseInt(process.env.PORT!);
const IP = parseInt(process.env.IP!);
app.use(
  cors({
    origin: ['https://beamish-custard-7ad3ca.netlify.app'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use('/api/users', userRouter);
app.use('/api/chats', authMiddleware, chatsRouter);
app.use('/api/messages', authMiddleware, messageRouter);
app.use(errorMiddleware);

mongoose.connect(process.env.DB_URL!);

const connection = async () => {
  try {
    await mongoose.connect(process.env.DB_URL!);
    console.log('connected to db');
    const server = app.listen(port || 5002, () => console.log('success'));
    new ServerSocket(server);
  } catch (e) {
    console.log(e);
  }
};

connection();
