import mongoose, { Schema, Types } from 'mongoose';
import { IChat, IMessage } from '../types';

interface IChatMessages {
  chatId: Types.ObjectId;
  messages: Array<IMessage>;
}

const ChatSchema = new Schema<IChatMessages>({
  chatId: mongoose.Schema.Types.ObjectId,
  messages: {
    type: [
      {
        messageText: { type: String },
        createdAt: {
          type: Date,
          default: new Date(),
        },
        from: {
          type: mongoose.Schema.Types.ObjectId,
        },
      },
    ],
  },
});

export default mongoose.model('Chat', ChatSchema);
