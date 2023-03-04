import mongoose, { Schema, Types } from 'mongoose';
import { IChat } from '../types';

const ChatSchema = new Schema<IChat>({
  members: [mongoose.Schema.Types.ObjectId],
});

export default mongoose.model('Chat', ChatSchema);
