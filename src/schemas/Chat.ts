import mongoose, { Schema, Types } from 'mongoose';
import { IChat } from '../types';

const ChatSchema = new Schema<IChat>(
  {
    _id: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
    },
    members: [mongoose.Schema.Types.ObjectId],
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
  },
  { toJSON: { virtuals: true } }
);

ChatSchema.virtual('membersCount').get(function () {
  return this.members.length;
});

export default mongoose.model('Chat', ChatSchema);
