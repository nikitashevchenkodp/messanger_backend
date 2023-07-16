import mongoose, { Schema, Types } from 'mongoose';
import { IMessage } from '../types';

const MessageSchema = new Schema<IMessage>(
  {
    content: {
      text: {
        type: String,
      },
      attachments: [String],
    },
    internalChatId: {
      type: String,
    },
    from: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
      },
      fullName: {
        type: String,
      },
      avatar: {
        type: String,
      },
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
