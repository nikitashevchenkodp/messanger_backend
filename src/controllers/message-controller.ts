import express, { Request, Response } from 'express';
import Chat from '../schemas/Chat';
import User from '../schemas/User';
import Message from '../schemas/Message';

class MessageController {
  async sendMessage(req: Request, res: Response) {
    try {
      const { from, messageText, chatId } = req.body;

      const newMessage = await Message.create({ messageText, from, chatId });
      console.log(newMessage);

      if (!newMessage) {
        throw Error('Non new message');
      }
      const unpdatedChat = await Chat.findByIdAndUpdate(chatId, { lastMessage: newMessage }, { new: true });
      return res.status(200).json(unpdatedChat);
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  async getMessagesFromChat(req: Request, res: Response) {
    try {
      const chatId = req.params.chatId;
      const messages = await Message.find({ chatId });

      return res.status(200).json(messages);
    } catch (error) {}
  }
  async getMessage(req: Request, res: Response) {
    try {
      const messageId = req.params.messageId;
      const message = await Message.findById(messageId);

      return res.status(200).json(message);
    } catch (error) {}
  }
}

export const messageController = new MessageController();
