import express, { Request, Response } from 'express';
import Chat from '../schemas/Chat';
import User from '../schemas/User';
import Message from '../schemas/Message';
import MessagesMap from '../schemas/MessagesMap';

class ChatsController {
  // async addChat(req: Request, res: Response) {
  //   try {
  //     const members = req.body.members;
  //     const newChat = await Chat.create({ members });

  //     const chatMembers = await User.find({ _id: { $in: members } });
  //     const users = await Promise.all(
  //       chatMembers.map(async (member) => {
  //         const newUserChats = [...member.chats, newChat._id];
  //         return await User.findByIdAndUpdate(member._id, { chats: newUserChats }, { new: true });
  //       })
  //     );
  //     return res.status(200).json({ newChat, users });
  //   } catch (error) {
  //     return res.status(500).json(error);
  //   }
  // }

  async getChatMessages(req: Request, res: Response) {
    try {
      const chatId = req.params.chatId;
      const messagesMap = await MessagesMap.findById(chatId);
      if (messagesMap) {
        return res.status(200).json(messagesMap.messages);
      }
    } catch (error) {}
  }

  async getAllChats(req: Request, res: Response) {
    try {
      const currentUserId = req.headers.authorization;
      const currentUser = await User.findById(currentUserId);

      if (!currentUser) {
        throw new Error('not such user');
      }
      //find all user chats
      const records = await Chat.find({ _id: { $in: currentUser.chats } });
      const result = await Promise.all(
        records.map(async (chat) => {
          const friendId = chat.members.find((member: any) => member._id.toString() !== currentUser._id.toString());
          const partner = await User.findById(friendId);
          const chatMessages = await MessagesMap.findById(chat._id);
          let lastMessage;
          if (chatMessages) {
            const { messages } = chatMessages;
            lastMessage = messages[messages.length - 1];
          }
          const { _id } = chat;
          return {
            chatId: _id.toString(),
            user: {
              fullName: partner?.fullName || '',
              id: partner?._id || '',
              avatar: partner?.avatar || '',
            },
            lastMessage: lastMessage || {},
          };
        })
      );

      return res.status(200).json(result);
    } catch (error) {}
  }
}

export const chatsController = new ChatsController();
