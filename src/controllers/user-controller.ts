import express, { Request, Response } from 'express';
import Chat from '../schemas/Chat';
import User from '../schemas/User';
import Message from '../schemas/Message';

class UserController {
  async registration(req: Request, res: Response) {
    try {
      return res.status(200);
    } catch (error) {
      console.log(error);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (user) {
        return res.status(200).json(user);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      const id = req.params.userId;

      const user = await User.findById(id);

      return res.status(200).json(user);
    } catch (error) {
      console.log(error);
    }
  }
  async addUser(req: Request, res: Response) {
    try {
      const { fullName, email, password } = req.body;
      const user = await User.find({ email });
      if (user) {
        return res.status(409).json({ message: `User with email "${email}" already exist` });
      }
      const newUser = await User.create({ fullName, email, password });
      return res.status(201).json(newUser);
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  async getAllUsers(req: Request, res: Response) {
    const currentUserId = req.headers.authorization;

    try {
      const allUsers = await User.find({ _id: { $ne: currentUserId } });

      const userListWithChatsId = await Promise.all(
        allUsers.map(async (user) => {
          const chat = await Chat.findOne({ members: [user._id, currentUserId].sort() });
          return { id: user._id, fullName: user.fullName, avatar: user.avatar, chatId: chat ? chat._id : '' };
        })
      );
      return res.status(200).json(userListWithChatsId);
    } catch (error) {
      console.log(error);
    }
  }
}

export const userController = new UserController();
