import mongoose, { Schema } from 'mongoose';

const TokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  refreshToken: {
    type: String,
    required: true,
  },
});

export default mongoose.model('Token', TokenSchema);
