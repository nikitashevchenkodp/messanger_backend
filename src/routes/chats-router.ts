import { Router } from 'express';
import { chatsController } from '../controllers/chat-controller';

const chatsRouter = Router();

chatsRouter.get('/', chatsController.getAllChats);
chatsRouter.get('/:chatId', chatsController.getChatMessages);
// chatsRouter.post('/', chatsController.addChat);

export default chatsRouter;
