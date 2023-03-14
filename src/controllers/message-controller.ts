import express, { Request, Response } from 'express';
import Message from '../schemas/Message';
import Chat from '../schemas/Chat';
import User from '../schemas/User';
import { IChat, IMessage, IMessageFromClient } from '../types';
import { messageService } from '../services/message-service';
import { chatService } from '../services/chat-service';

class MessageController {
  async sendMessage(req: Request, res: Response) {
    try {
      const { from, to, messageText, chatId } = req.body;
      let chat;
      if (!chatId) {
        chat = await chatService.createChat(from, to);
      } else {
        chat = await Chat.findById(chatId);
      }

      const newMessage = await messageService.createMessage(from, to, messageText, chat ? chat._id : chatId);
      await messageService.saveMessage(chat ? chat._id : chatId, newMessage);

      return res.status(201).json(newMessage);
    } catch (error) {
      console.log(error);

      return res.status(500).json(error);
    }
  }
}

export const messageController = new MessageController();
