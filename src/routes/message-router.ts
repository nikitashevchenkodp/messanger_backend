import { Router } from 'express';
import { messageController } from '../controllers/message-controller';

const messageRouter = Router();

// messageRouter.get('/chats/:chatId', messageController.getMessagesFromChat);
// messageRouter.get('/:messageId', messageController.getMessage);
messageRouter.post('/send', messageController.sendMessage);

export default messageRouter;
