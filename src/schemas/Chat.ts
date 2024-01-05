import mongoose, { Schema, Types } from 'mongoose';
import { IChat } from '../types';

enum ChatTypes {
  Privat = 'privat',
  Group = 'group',
  Chanel = 'chanel',
}

export interface IChatSchema {
  _id: Types.ObjectId;
  owner: mongoose.Schema.Types.ObjectId;
  type: ChatTypes;
  members: Array<mongoose.Schema.Types.ObjectId>;
  messages: Array<mongoose.Schema.Types.ObjectId>;
  internalId: string;
  title?: string;
  avatar?: string;
  folders: Array<mongoose.Schema.Types.ObjectId>;
}

const ChatSchema = new Schema<IChat>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: ['private', 'group', 'chanel'],
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    internalId: {
      type: String,
    },
    title: {
      type: String,
      required: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    folders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: [],
      },
    ],
  },
  { toJSON: { virtuals: true } }
);

ChatSchema.virtual('membersCount').get(function () {
  return this.members.length;
});

export default mongoose.model('Chat', ChatSchema);
