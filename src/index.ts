require('dotenv').config();
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { chatsRouter, messageRouter, userRouter } from './routes';
import { ServerSocket } from './socket';
import Chat from './schemas/Chat';

mongoose.set('strictQuery', false);

const app: Express = express();
const port = parseInt(process.env.APP_PORT!);
const IP = parseInt(process.env.IP!);
app.use(
  cors({
    origin: '*',
  })
);
app.use(express.json());
app.use('/api/users', userRouter);
app.use('/api/chats', chatsRouter);
app.use('/api/messages', messageRouter);

mongoose.connect(process.env.DB_URL!);

const server = app.listen(port, () => console.log('success'));

new ServerSocket(server);
