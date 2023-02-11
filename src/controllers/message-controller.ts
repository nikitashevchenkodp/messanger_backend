import express, { Request, Response } from 'express';
import Message from '../schemas/Message';
import Chat from '../schemas/Chat';
import User from '../schemas/User';

class MessageController {
  async sendMessage(req: Request, res: Response) {
    try {
      const { from, to, messageText, chatId } = req.body;
      const newMessage = await Message.create({ messageText, from });

      if (!chatId) {
        const newChat = await Chat.create({ members: [from, to], messages: [newMessage], lastMessage: newMessage });
        console.log(newChat);

        const users = await User.updateMany(
          { _id: { $in: [from, to] } },
          { $addToSet: { chats: newChat._id } },
          { new: true }
        );
        console.log(users);

        return res.status(200).json(newChat);
      } else {
        const chat = await Chat.findById(chatId);
        if (chat) {
          const { messages } = chat;
          const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { messages: [...messages, newMessage], lastMessage: newMessage },
            { new: true }
          );
          console.log(updatedChat);
          return res.status(200).json(updatedChat);
        }
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  }
}

export const messageController = new MessageController();
