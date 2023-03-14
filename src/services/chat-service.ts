import Chat from '../schemas/Chat';
import MessagesMap from '../schemas/MessagesMap';
import User from '../schemas/User';
import { IChat, IMessage } from '../types';

class ChatService {
  createChat = async (from: string, to: string) => {
    console.log('createChat');
    console.log(from, to);

    const newChat = await Chat.create({ members: [from, to] });
    console.log(newChat);

    const map = await MessagesMap.create({ _id: newChat._id });

    await User.updateMany({ _id: { $in: [from, to] } }, { $addToSet: { chats: newChat._id } }, { new: true });

    return newChat;
  };

  deleteChat = async () => {};

  getChat = async () => {};

  getAllChats = async () => {};
}

export const chatService = new ChatService();
