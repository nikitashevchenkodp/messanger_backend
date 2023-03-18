import mongoose, { Schema, Types } from 'mongoose';
import { IMessage } from '../types';

const MessageSchema = new Schema<IMessage>(
  {
    text: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: new Date(),
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
  },
  { timestamps: true }
);

export default mongoose.model('Message', MessageSchema);
