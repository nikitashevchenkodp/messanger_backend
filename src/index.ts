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
const IP = process.env.IP!;
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://192.168.0.10:3000', 'https://beamish-custard-7ad3ca.netlify.app'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use('/api/users', userRouter);
app.use('/api/chats', authMiddleware, chatsRouter);
app.use('/api/messages', authMiddleware, messageRouter);
app.use(errorMiddleware);

const connection = async () => {
  try {
    await mongoose.connect(process.env.DB_URL!);
    console.log('connected to db');

    const server = app.listen(5002, '192.168.0.10', () => console.log('started on', IP + ':5002'));
    new ServerSocket(server);
  } catch (e) {
    console.log(e);
  }
};

connection();
