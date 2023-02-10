import mongoose, { Schema, Types } from 'mongoose';
import { IUser } from '../types';

const UserSchema = new Schema<IUser>({
  fullName: { type: String, default: '' },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  chats: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
    default: [],
  },
});

export default mongoose.model('User', UserSchema);
