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
      const interalChatId = chatService.transformToInternalChatId(chatId, user._id);
      let messages;
      if (isUserId(chatId)) {
        messages = await messageService.getMessagesByChatId(interalChatId!);
      } else {
        messages = await messageService.getMessagesByChatId(chatId);
      }

      const result = messages?.map((msg) => {
        if (msg.chatId.toString() === user._id) {
          return { ...msg.toJSON(), chatId: chatId };
        }
        return msg;
      });

      res.status(200).json(result);
    } catch (error) {}
  };
}

export const messageController = new MessageController();
