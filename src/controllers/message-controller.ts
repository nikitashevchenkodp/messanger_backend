import { Request, Response } from 'express';

import { messageService } from '../services/message-service';
import { chatService } from '../services/chat-service';
import tokenService from '../services/token-service';
import { isUserId } from '../helpers';

class MessageController {
  getMessagesByChatId = async (req: Request, res: Response) => {
    try {
      const { chatId } = req.params;
      const token = req.headers.authorization;
      const user = tokenService.validateAccessToken(token!) as any;

      let messages;

      if (isUserId(chatId)) {
        const interalChatId = chatService.transformToInternalChatId(chatId, user._id);
        messages = await messageService.getMessagesByChatId(interalChatId!);
      } else {
        messages = await messageService.getMessagesByChatId(chatId);
      }

      const result = messages?.map((msg) => {
        const msgJson = msg.toJSON();

        if (msg.chatId.toString() === user._id) {
          return { ...msgJson, chatId: chatId, id: msgJson._id };
        }
        return { ...msgJson, id: msgJson._id };
      });

      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
    }
  };

  getAllUserMessagesByChatIds = async (req: Request, res: Response) => {
    console.log('works');

    try {
      const token = req.headers.authorization;
      const user = tokenService.validateAccessToken(token!) as any;
      const allUserChats = await chatService.getAllChats(user._id);

      const allmessagesByChatId = await Promise.all(
        allUserChats?.map(async (chat) => {
          let chatId = chat.id;
          if (chat.internalId) {
            chatId = chat.internalId;
          }
          const messages = await messageService.getMessagesByChatId(chatId);

          const result = messages?.map((msg) => {
            if (msg.chatId.toString() === user._id) {
              return { ...msg.toJSON(), chatId: msg.from };
            }
            return msg;
          });

          return { [result?.[0]?.chatId.toString() || '']: result };
        }) || []
      );
      return res.status(200).json(allmessagesByChatId);
    } catch (error) {
      res.status(500).json({ msg: 'Smth went wrong' });
    }
  };
}

export const messageController = new MessageController();
