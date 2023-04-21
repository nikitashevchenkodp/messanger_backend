import { Request, Response } from 'express';

import { messageService } from '../services/message-service';
import { chatService } from '../services/chat-service';
import tokenService from '../services/token-service';

class MessageController {
  async sendMessage(req: Request, res: Response) {
    // try {
    //   const { from, to, messageText, chatId } = req.body;
    //   let chat;
    //   if (!chatId) {
    //     chat = await chatService.createChat(from, to);
    //   } else {
    //     chat = await Chat.findById(chatId);
    //   }
    //   const newMessage = await messageService.createMessage(from, to, messageText, chat ? chat._id : chatId);
    //   // await messageService.saveMessage(chat ? chat._id : chatId, newMessage);
    //   return res.status(201).json(newMessage);
    // } catch (error) {
    //   console.log(error);
    //   return res.status(500).json(error);
    // }
  }

  getMessagesByChatId = async (req: Request, res: Response) => {
    try {
      const { chatId } = req.params;
      const token = req.headers.authorization;
      const user = tokenService.validateAccessToken(token!) as any;
      const interalChatId = chatService.transformToInternalChatId(chatId, user._id);
      const messages = await messageService.getMessagesByChatId(interalChatId!);
      console.log(user._id);

      const result = messages?.map((msg) => {
        if (msg.chatId.toString() === user._id) {
          return { ...msg.toJSON(), chatId: chatId };
        }
        return msg;
      });
      console.log(result);

      res.status(200).json(result);
    } catch (error) {}
  };
}

export const messageController = new MessageController();
