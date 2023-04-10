import { Router } from 'express';
import { userController } from '../controllers/user-controller';
import authMiddleware from '../middlewares/auth-middleware';

const userRouter = Router();

userRouter.get('/', authMiddleware, userController.getAllUsers);
userRouter.get('/refresh', userController.refresh);
userRouter.post('/create', userController.addUser);
userRouter.post('/signup', userController.registration);
userRouter.post('/login', userController.login);
userRouter.get('/:userId', userController.getUser);

export default userRouter;
