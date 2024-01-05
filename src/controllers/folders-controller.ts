import { NextFunction, Request, Response } from 'express';
import { foldersService } from '../services/folders-service';

class FoldersController {
  createFolder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, chatId } = req.body;
      const folder = await foldersService.createFolder(name, chatId);

      return res.status(201).json(folder);
    } catch (error) {
      next(error);
    }
  };

  deleteFolder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { folderId } = req.body;
      await foldersService.deleteFolder(folderId);

      return res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  editFolder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { folderName, folderId } = req.body;

      const folder = await foldersService.editFolder(folderName, folderId);

      return res.status(200).json({ folder });
    } catch (error) {
      next(error);
    }
  };
  addChatToFolders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { folderIds, chatId } = req.body;

      const folder = await foldersService.addChatToFolders(folderIds, chatId);
      return res.status(200).json({ folder });
    } catch (error) {
      next(error);
    }
  };

  getFoldersList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const folders = await foldersService.getFoldersList();

      return res.status(200).json({ folders });
    } catch (error) {
      next(error);
    }
  };
}

export const foldersController = new FoldersController();
