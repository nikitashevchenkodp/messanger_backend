import mongoose, { Schema, Types } from 'mongoose';
import { IMessage } from '../types';

const MessageSchema = new Schema<IMessage>(
  {
    text: {
      type: String,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
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
