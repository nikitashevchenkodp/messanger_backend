import mongoose, { Schema, Types } from 'mongoose';
import { IMessage } from '../types';

const MessageSchema = new Schema<IMessage>(
  {
    text: {
      type: String,
    },
    internalChatId: {
      type: String,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
    },
    chatId: {
      type: String,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    reactions: {
      type: [
        {
          reaction: String,
          by: {
            id: mongoose.Schema.Types.ObjectId,
            avatar: String,
            fullName: String,
          },
        },
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Message', MessageSchema);
