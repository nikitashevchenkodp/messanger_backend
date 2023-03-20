import express, { Request, Response } from 'express';
import Chat from '../schemas/Chat';
import User from '../schemas/User';
import Message from '../schemas/Message';
import MessagesMap from '../schemas/MessagesMap';
import { chatService } from '../services/chat-service';

class ChatsController {
  async getAllChats(req: Request, res: Response) {
    try {
      const currentUserId = req.headers.authorization;

      //find all user chats
      const records = await chatService.getAllChats(currentUserId!);
      const result = await Promise.all(
        records!.map(async (chat) => {
          const friendId = chat.members.find((member: any) => member._id.toString() !== currentUserId);
          const partner = await User.findById(friendId);
          const { _id } = chat;
          return {
            chatId: _id.toString(),
            user: {
              fullName: partner?.fullName || '',
              id: partner?._id || '',
              avatar: partner?.avatar || '',
            },
          };
        })
      );

      return res.status(200).json(result);
    } catch (error) {}
  }

  async getChat(req: Request, res: Response) {
    try {
      const { chatId } = req.params;
      const userId = req.headers.authorization;
      const chatItem = await chatService.getChat(userId!, chatId);
      res.status(200).json(chatItem);
    } catch (error) {}
  }
}

export const chatsController = new ChatsController();
