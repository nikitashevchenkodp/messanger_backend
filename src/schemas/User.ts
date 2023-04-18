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
  nickname: {
    type: String,
    defalt: '',
  },
  lastTimeOnline: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model('User', UserSchema);
