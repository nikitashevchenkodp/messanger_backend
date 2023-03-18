import mongoose, { Schema, Types } from 'mongoose';
import { IChat, IMessage } from '../types';

interface IMessagesMap {
  messages: Array<IMessage>;
}

const MessagesMapSchema = new Schema<IMessagesMap>({
  messages: {
    type: [
      {
        text: { type: String },
        createdAt: {
          type: Date,
          default: new Date(),
        },
        from: {
          type: mongoose.Schema.Types.ObjectId,
        },
        chatId: {
          type: mongoose.Schema.Types.ObjectId,
        },
      },
    ],
    default: [],
  },
});

export default mongoose.model('MessagesMapSchema', MessagesMapSchema);
