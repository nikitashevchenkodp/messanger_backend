import Message from '../schemas/Message';
import { chatService } from './chat-service';

class MessageService {
  createMessage = async (from: string, to: string, text: string, chatId: string) => {
    let chat;
    if (!chatId) {
      chat = await chatService.createChat(from, to);
    }
    const newMessage = await Message.create({ from, to, text, chatId: chat ? chat._id : chatId });
    return newMessage;
  };

  deleteMessage = async (id: string) => {
    try {
      const deletedMessage = await Message.findByIdAndDelete(id);
      const messagesInThisChat = await this.getMessagesByChatId(deletedMessage?.chatId?.toString()!);
      if (messagesInThisChat && messagesInThisChat.length === 0) {
        await chatService.deleteChat(deletedMessage?.chatId?.toString()!);
      }
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
      const userAlreadyMadeReaction = targetMessage?.reactions.find((reaction) => {
        return reaction.by.id.toString() === newReaction.by.id;
      });
      console.log(userAlreadyMadeReaction);

      if (userAlreadyMadeReaction) {
        console.log('user already made reaction');
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

      return messageWithAddedReaction;
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
      return messageWithDeletedReaction;
    } catch (error) {
      console.log(error);
    }
  };

  getMessagesByChatId = async (chatId: string) => {
    try {
      const messages = await Message.find({ chatId });
      return messages;
    } catch (error) {
      console.log(error);
    }
  };
}

export const messageService = new MessageService();
