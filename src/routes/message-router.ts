import { Router } from 'express';
import { messageController } from '../controllers/message-controller';

const messageRouter = Router();

// messageRouter.get('/chats/:chatId', messageController.getMessagesFromChat);
messageRouter.get('/:chatId', messageController.getMessagesByChatId);
messageRouter.post('/send', messageController.sendMessage);

export default messageRouter;
