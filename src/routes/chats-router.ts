import { Router } from 'express';
import { chatsController } from '../controllers/chat-controller';

const chatsRouter = Router();

chatsRouter.get('/', chatsController.getAllChats);
chatsRouter.post('/', chatsController.addChat);

export default chatsRouter;
