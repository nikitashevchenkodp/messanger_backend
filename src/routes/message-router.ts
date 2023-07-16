import { Router } from 'express';
import { messageController } from '../controllers/message-controller';

const messageRouter = Router();

messageRouter.get('/:chatId', messageController.getMessagesByChatId);
messageRouter.get('/', messageController.getAllUserMessagesByChatIds);

export default messageRouter;
