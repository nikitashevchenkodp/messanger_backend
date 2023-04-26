import { Router } from 'express';
import { chatsController } from '../controllers/chat-controller';

const chatsRouter = Router();

chatsRouter.get('/', chatsController.getAllChats);
chatsRouter.get('/:chatId', chatsController.getChat);
chatsRouter.post('/create', chatsController.createGroupChat);
chatsRouter.post('/add-participants', chatsController.addMembersToGroupChat);

export default chatsRouter;
