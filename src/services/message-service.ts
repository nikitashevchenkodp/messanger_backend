import { Document } from 'mongodb';
import { Types } from 'mongoose';
import Message from '../schemas/Message';
import MessagesMap from '../schemas/MessagesMap';
import { IMessage, IMessageFromClient } from '../types';
import { chatService } from './chat-service';

class MessageService {
  createMessage = async (from: string, to: string, text: string, chatId: string) => {
    const message = await Message.create({ from, to, text, chatId });
    console.log(message);
    return message;
  };

  saveMessage = async (
    chatId: string,
    //@ts-ignore
    message: Document<unknown, any, IMessage> &
      IMessage &
      Required<{
        _id: Types.ObjectId;
      }>
  ) => {
    await MessagesMap.findByIdAndUpdate(chatId, { $push: { messages: message } });
  };

  deleteMessage = async (id: string) => {
    try {
      const deletedMessage = await Message.findOneAndDelete({ _id: id });
      const allChatMessages = await MessagesMap.findByIdAndUpdate(
        deletedMessage?.chatId,
        {
          $pull: { messages: { _id: deletedMessage?._id } },
        },
        { new: true }
      );
      if (allChatMessages?.messages.length === 0) {
        await chatService.deleteChat(deletedMessage?.chatId);
        await MessagesMap.findByIdAndDelete(deletedMessage?.chatId);
      }
    } catch (error) {
      console.log(error);
    }
  };

  getMessage = async () => {};

  getMessagesByChatId = async () => {};
}

export const messageService = new MessageService();
