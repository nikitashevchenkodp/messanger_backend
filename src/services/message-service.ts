import MessageDto, { PrivatMessageDto } from '../dtos/message-dto';
import { isUserId } from '../helpers';
import Chat from '../schemas/Chat';
import Message, { IMessageSchema, MessageFromClient } from '../schemas/Message';
import { chatService } from './chat-service';

class MessageService {
  createMessage = async (msgFromclient: MessageFromClient) => {
    const { chatId, content, from } = msgFromclient;
    const internalChatId = chatService.transformToInternalChatId(chatId, from.id);

    let isPrivatMessage = isUserId(chatId);
    let newMessage;

    if (isPrivatMessage) {
      let chat = await Chat.findOne({ internalId: internalChatId });

      if (!chat) {
        chat = await chatService.createChat(from.id, chatId);
      }
      newMessage = await Message.create({ from, content, chatId, internalChatId });
    } else {
      // If group message, we dont need internalChat id, because it is the same for all paticipants
      newMessage = await Message.create({ from, content, chatId });
    }
    return newMessage;
  };

  transformMessageForReceiver(message: PrivatMessageDto<IMessageSchema>): PrivatMessageDto<IMessageSchema> {
    return { ...message, chatId: message.from.id };
  }

  deleteMessages = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map(async (id) => {
          const deletedMessage = await Message.findByIdAndRemove(id);
          const messagesInThisChat = await this.getMessagesByChatId(deletedMessage?.internalChatId!);
          if (messagesInThisChat && messagesInThisChat.length === 0) {
            await chatService.deleteChat(deletedMessage?.internalChatId!);
          }
        })
      );
    } catch (error) {
      console.log(error);
    }
  };
  editMessage = async (id: string, text: string) => {
    try {
      const editedMessage = await Message.findByIdAndUpdate(id, { text, edited: true }, { new: true });
      return editedMessage;
    } catch (error) {
      console.log(error);
    }
  };
  addReaction = async (messageId: string, newReaction: any) => {
    try {
      let messageWithAddedReaction;
      const targetMessage = await Message.findById(messageId);
      const userAlreadyMadeReaction = targetMessage?.reactions?.find((reaction) => {
        return reaction.by.id.toString() === newReaction.by.id;
      });

      if (userAlreadyMadeReaction) {
        // delete old reactin
        const res = await Message.findByIdAndUpdate(
          messageId,
          { $pull: { reactions: { 'by.id': userAlreadyMadeReaction.by.id } } },
          { new: true }
        );
      }
      // Add new reaction
      messageWithAddedReaction = await Message.findByIdAndUpdate(
        messageId,
        { $push: { reactions: newReaction } },
        { new: true }
      );

      return messageWithAddedReaction?.reactions;
    } catch (error) {
      console.log(error);
    }
  };

  deleteReaction = async (messageId: string, reactionId: any) => {
    try {
      const messageWithDeletedReaction = await Message.findByIdAndUpdate(
        messageId,
        { $pull: { reactions: { _id: reactionId } } },
        { new: true }
      );
      return reactionId;
    } catch (error) {
      console.log(error);
    }
  };

  getMessagesByChatId = async (chatId: string) => {
    try {
      let messages;
      const isPrivatChat = isUserId(chatId);
      if (isPrivatChat) {
        messages = await Message.find({ internalChatId: chatId });
      } else {
        messages = await Message.find({ chatId: chatId });
      }
      return messages;
    } catch (error) {
      console.log(error);
    }
  };
}

export const messageService = new MessageService();
