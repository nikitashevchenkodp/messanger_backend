import { v4 } from 'uuid';
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
  createChat = async (user1: string, user2: string) => {
    console.log('create new chat');

    const internalId = this.transformToInternalChatId(user1, user2);
    const id = v4();
    const newChat = await Chat.create({
      _id: id,
      members: [user1, user2].sort(),
      internalId: internalId,
      type: 'privat',
    });
    return newChat;
  };

  createGroupChat = async (ownerId: string, members: string[], title: string) => {
    const id = `-${v4()}`;
    const newGroupChatorChannel = await Chat.create({
      _id: id,
      owner: ownerId,
      members: [...members, ownerId],
      title,
      type: 'group',
    });
    return newGroupChatorChannel;
  };

  addParticipantsToGroupChat = async (chatId: string, newMembers: string[]) => {
    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId },
      { $push: { members: { $each: newMembers } }, $set: { membersCount: { $size: '$members' } } },
      { new: true }
    );
    return updatedChat;
  };

  deleteChat = async (chatId: string) => {
    try {
      const deletedChat = await Chat.findByIdAndDelete({ internalId: chatId });
      return deletedChat;
    } catch (error) {
      console.log(error);
    }
  };

  transformToInternalChatId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join('&');
  };

  togglePinnedStatus = async (chatId: string, newStatus: boolean) => {};

  toggleMuteStatus = async (chatId: string, newStatus: boolean) => {};

  getChat = async (userId: string, id: string) => {
    const internalId = this.transformToInternalChatId(userId, id);
    const chat = await Chat.findOne({ internalId: internalId });
    const friendId = chat?.members.find((member: any) => member._id.toString() !== userId);
    const partner = await User.findById(friendId);
    const res = {
      id,
      title: partner?.fullName || '',
      avatar: partner?.avatar || '',
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
