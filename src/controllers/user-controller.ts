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
      const user = await User.find({ email });
      if (user) {
        return res.status(200).json(user[0]);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      const id = req.params.userId;
      console.log(id);

      const user = await User.findById(id);
      console.log(user);

      return res.status(200).json(user);
    } catch (error) {
      console.log(error);
    }
  }
  async addUser(req: Request, res: Response) {
    try {
      const { fullName, email, password } = req.body;
      const newUser = await User.create({ fullName, email, password });
      return res.status(200).json(newUser);
    } catch (error) {
      return res.status(500).json(error);
    }
  }
  async addChat(req: Request, res: Response) {
    try {
      const members = req.body.members;
      const newChat = await Chat.create({ members });
      const currentUserId = req.headers.authorization;
      const currentUser = await User.findById(currentUserId);
      if (!currentUser) {
        throw new Error('not such user');
      }
      const newUserChats = [...currentUser.chats, newChat._id];
      const userWithupdatedChats = await User.findByIdAndUpdate(currentUser, { chats: newUserChats }, { new: true });

      return res.status(200).json({ newChat, userWithupdatedChats });
    } catch (error) {
      return res.status(500).json(error);
    }
  }
  async addMessage(req: Request, res: Response) {}

  async getAllUsers(req: Request, res: Response) {
    try {
      const allChats = await User.find();
      return res.status(200).json(allChats);
    } catch (error) {
      console.log(error);
    }
  }
}

export const userController = new UserController();
