import express, { Request, Response } from 'express';
import Chat from '../schemas/Chat';
import User from '../schemas/User';
import Message from '../schemas/Message';
import MessagesMap from '../schemas/MessagesMap';
import { chatService } from '../services/chat-service';
import tokenService from '../services/token-service';

class ChatsController {
  async getAllChats(req: Request, res: Response) {
    try {
      const token = req.headers.authorization;
      const user = tokenService.validateAccessToken(token!) as any;

      //find all user chats
      const records = await chatService.getAllChats(user._id);
      const result = await Promise.all(
        records!.map(async (chat) => {
          const friendId = chat.members.find((member: any) => member._id.toString() !== user._id);
          const partner = await User.findById(friendId);
          return {
            id: friendId,
            title: partner?.fullName || '',
            avatar: partner?.avatar || '',
          };
        })
      );
      return res.status(200).json(result);
    } catch (error) {}
  }

  async getChat(req: Request, res: Response) {
    try {
      const { chatId } = req.params;
      const token = req.headers.authorization;
      const user = tokenService.validateAccessToken(token!) as any;
      const chatItem = await chatService.getChat(user?._id!, chatId);
      res.status(200).json(chatItem);
    } catch (error) {
      console.log(error);
    }
  }
}

export const chatsController = new ChatsController();
