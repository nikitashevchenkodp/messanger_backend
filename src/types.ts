import { Types } from 'mongoose';

export interface IMessage {
  _id: Types.ObjectId;
  text: string;
  createdAt: Date;
  from: Types.ObjectId;
  to: Types.ObjectId;
  chatId: Types.ObjectId;
  edited: boolean;
  reactions: {
    reaction: string;
    by: {
      id: string;
      avatar: string;
      fullname: string;
    };
  }[];
}

export interface IChat {
  _id: Types.ObjectId;
  chatId: Types.ObjectId;
  members: Array<string>;
  messages: Array<IMessage>;
  lastMessage: IMessage;
}
export interface IUser {
  fullName: string;
  email: string;
  password: string;
  avatar: string;
}

export interface IMessageFromClient {
  from: string;
  to: string;
  messageText: string;
  chatId: string;
}
