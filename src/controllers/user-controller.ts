import express, { NextFunction, Request, Response } from 'express';
import Chat from '../schemas/Chat';
import User from '../schemas/User';
import Message from '../schemas/Message';
import { userService } from '../services/user-service';
import { nextTick } from 'process';
import tokenService from '../services/token-service';

class UserController {
  async registration(req: Request, res: Response) {
    try {
      return res.status(200);
    } catch (error) {
      console.log(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const userData = await userService.login(email, password);
      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.userId;
      const user = await User.findById(id);

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
  async addUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { fullName, email, password, nickname } = req.body;

      const userData = await userService.createUser(email, password, nickname, fullName);
      if ('refreshToken' in userData) {
        res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      }
      res.json(userData);
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response) {
    const token = req.headers.authorization;
    const currentUser = tokenService.validateAccessToken(token!) as any;
    try {
      const allUsers = await User.find({ _id: { $ne: currentUser._id } });
      const userListWithChatsId = await Promise.all(
        allUsers.map(async (user) => {
          const chat = await Chat.findOne({ members: [user._id, currentUser._id].sort() });
          return { id: user._id, fullName: user.fullName, avatar: user.avatar, chatId: chat ? chat._id : '' };
        })
      );
      return res.status(200).json(userListWithChatsId);
    } catch (error) {
      console.log(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      console.log('refresh token', refreshToken);

      const userData = await userService.refresh(refreshToken);
      console.log('new refresh token', userData.refreshToken);

      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      return res.json(userData);
    } catch (error) {
      console.log(error);

      next(error);
    }
  }
}

export const userController = new UserController();
