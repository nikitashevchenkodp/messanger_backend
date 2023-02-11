import mongoose, { Schema, Types } from 'mongoose';
import { IChat } from '../types';

const ChatSchema = new Schema<IChat>({
  members: [mongoose.Schema.Types.ObjectId],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
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
    default: [],
  },
});

export default mongoose.model('Chat', ChatSchema);
