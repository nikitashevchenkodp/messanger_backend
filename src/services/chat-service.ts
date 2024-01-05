import { v4 } from 'uuid';
import Chat from '../schemas/Chat';
import User from '../schemas/User';

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
