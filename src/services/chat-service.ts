import Chat from '../schemas/Chat';
import MessagesMap from '../schemas/MessagesMap';
import User from '../schemas/User';
import { IChat, IMessage } from '../types';

// class ChatService {
//   createChat = async (from: string, to: string) => {
//     console.log('createChat');
//     console.log(from, to);

//     const newChat = await Chat.create({ members: [from, to] });
//     console.log(newChat);

//     const map = await MessagesMap.create({ _id: newChat._id });

//     await User.updateMany({ _id: { $in: [from, to] } }, { $addToSet: { chats: newChat._id } }, { new: true });

//     return newChat;
//   };

//   deleteChat = async (id: any) => {
//     try {
//       await Chat.findByIdAndDelete(id);
//     } catch (error) {}
//   };

//   getChat = async () => {};

//   getAllChats = async () => {};
// }

// export const chatService = new ChatService();

class ChatService {
  createChat = async (from: string, to: string) => {
    try {
      const newChat = await Chat.create({ members: [from, to] });
      return newChat;
    } catch (error) {
      console.log(error);
    }
  };

  deleteChat = async (chatId: string) => {
    try {
      const deletedChat = await Chat.findByIdAndDelete(chatId);
      return deletedChat;
    } catch (error) {
      console.log(error);
    }
  };

  togglePinnedStatus = async (chatId: string, newStatus: boolean) => {};

  toggleMuteStatus = async (chatId: string, newStatus: boolean) => {};

  getChat = async (userId: string, id: string) => {
    const chat = await Chat.findById(id);
    const friendId = chat?.members.find((member: any) => member._id.toString() !== userId);
    const partner = await User.findById(friendId);
    const res = {
      chatId: id,
      user: {
        fullName: partner?.fullName || '',
        id: partner?._id || '',
        avatar: partner?.avatar || '',
      },
    };
    return res;
  };

  getAllChats = async (userId: string) => {
    try {
      const chats = await Chat.find({ members: { $in: [userId] } });
      return chats;
    } catch (error) {}
  };
}

export const chatService = new ChatService();
