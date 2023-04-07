import { Router } from 'express';
import { userController } from '../controllers/user-controller';

const userRouter = Router();

userRouter.get('/', userController.getAllUsers);
userRouter.post('/create', userController.addUser);
userRouter.post('/signup', userController.registration);
userRouter.post('/login', userController.login);
userRouter.get('/:userId', userController.getUser);

export default userRouter;
