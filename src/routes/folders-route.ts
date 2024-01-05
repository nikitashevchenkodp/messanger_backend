import { Router } from 'express';
import { foldersController } from '../controllers/folders-controller';

const foldersRouter = Router();

foldersRouter.get('/', foldersController.getFoldersList);
foldersRouter.post('/create', foldersController.createFolder);
foldersRouter.post('/delete', foldersController.deleteFolder);
foldersRouter.post('/edit', foldersController.editFolder);
foldersRouter.post('/add', foldersController.addChatToFolders);

export default foldersRouter;
