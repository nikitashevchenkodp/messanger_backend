import mongoose, { Schema } from 'mongoose';

const FolderSchema = new Schema({
  name: {
    type: String,
  },
  includedChatIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      default: [],
    },
  ],
});

export default mongoose.model('Folder', FolderSchema);
