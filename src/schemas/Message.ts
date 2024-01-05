import mongoose, { Schema, Types } from 'mongoose';
import { IMessage } from '../types';

export interface IMessageReaction {
  reaction: string;
  by: {
    id: mongoose.Schema.Types.ObjectId;
    avatar: string;
    fullname: string;
  };
}

export interface IMessageContent {
  text: string;
  video?: string[];
  imgs?: string[];
  audio?: string[];
}

export interface MessageFromClient {
  from: {
    id: string;
    fullName: string;
    avatar: string;
  };
  content: IMessageContent;
  chatId: string;
}

enum MessageSentStatus {
  Sent = 'pending',
  Delivered = ' delivered',
  Canceled = 'canceled',
}

enum MessageStatus {
  Read = 'read',
  Unread = 'unread',
}

export interface IFromMessage {
  id: mongoose.Schema.Types.ObjectId;
  fullName: string;
  avatar: string;
}

export interface IMessageSchema {
  _id: mongoose.Schema.Types.ObjectId;
  internalChatId: string;
  createdAt: Date;
  from: IFromMessage;
  chatId: mongoose.Schema.Types.ObjectId;
  edited: boolean;
  sentStatus?: MessageSentStatus;
  status?: MessageStatus;
  content: IMessageContent;
  reactions?: Array<IMessageReaction>;
}

const MessageSchema = new Schema<IMessageSchema>(
  {
    internalChatId: String,
    content: {
      text: String,
      video: [String],
      imgs: [String],
      audio: [String],
    },
    from: {
      id: mongoose.Schema.Types.ObjectId,
      fullName: String,
      avatar: String,
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
      required: false,
    },
    sentStatus: {
      type: String,
      enum: ['pending', 'delivered', 'canceled'],
      required: false,
    },
    status: {
      type: String,
      enum: ['read', 'unread'],
      required: false,
    },
    createdAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Message', MessageSchema);
