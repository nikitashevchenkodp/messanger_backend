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
          let record;
          if (chat.type === 'privat') {
            const friendId = chat.members.find((member: any) => member._id.toString() !== user._id);
            const partner = await User.findById(friendId);
            record = {
              id: friendId,
              title: partner?.fullName || '',
              avatar: partner?.avatar || '',
            };
          } else if (chat.type === 'group') {
            record = {
              id: chat.id,
              title: chat.title,
              avatar: chat.avatar || '',
              membersCount: chat.membersCount,
              members: chat.members,
              type: chat.type,
            };
          }
          return record;
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

  async createGroupChat(req: Request, res: Response) {
    try {
      const { membersIds, title } = req.body;
      const token = req.headers.authorization;
      const user = tokenService.validateAccessToken(token!) as any;
      const groupChat = await chatService.createGroupChat(user?._id!, membersIds, title);
      res.status(201).json(groupChat);
    } catch (error) {
      console.log(error);
    }
  }
  async addMembersToGroupChat(req: Request, res: Response) {
    try {
      const { chatId, membersIds } = req.body;
      const updatedChat = await chatService.addParticipantsToGroupChat(chatId, membersIds);
      res.status(201).json(updatedChat);
    } catch (error) {
      console.log(error);
    }
  }
}

export const chatsController = new ChatsController();
