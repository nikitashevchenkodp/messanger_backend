import Folder from '../schemas/Folder';

class FoldersService {
  createFolder = async (name: string, chatId: string) => {
    const existingFolder = await Folder.findOne({ name });

    if (existingFolder) {
      return existingFolder;
    }

    const newFolder = await Folder.create({ name, includedChatIds: [chatId] });
    return newFolder;
  };

  addChatToFolders = async (folderIds: string[], chatId: string) => {
    const updatedFolder = await Folder.updateMany(
      { includedChatIds: folderIds },
      { $push: { includedChatIds: chatId } },
      { new: true }
    );

    return updatedFolder;
  };

  deleteFolder = async (id: string) => {
    await Folder.deleteOne({ _id: id });
  };

  editFolder = async (id: string, name: string) => {
    const editedFolder = await Folder.findOneAndUpdate({ _id: id }, { name }, { new: true });

    return editedFolder;
  };

  getFoldersList = async () => {
    const folders = await Folder.find();

    return folders;
  };
}

export const foldersService = new FoldersService();
