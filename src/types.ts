import { Types } from 'mongoose';

export interface IMessage {
  _id: Types.ObjectId;
  internalChatId: string;
  text: string;
  createdAt: Date;
  from: Types.ObjectId;
  chatId: string;
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
  type: 'privat' | 'group' | 'channel';
  members: Array<string>;
  messages: Array<IMessage>;
  lastMessage: IMessage;
  internalId: string;
  owner?: Types.ObjectId;
  title?: string;
  membersCount?: number;
  avatar?: string;
}
export interface IUser {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  avatar: string;
  nickname: string;
  lastTimeOnline: number;
}

export interface IMessageFromClient {
  from: string;
  to: string;
  messageText: string;
  chatId: string;
}

interface Chat {
  _id: Types.ObjectId;
  internalId: string;
  members: Types.ObjectId[];
}

// я отправляю пользователю с айди 123 сообщение в чат айди 123
// формирую из своего айдишника и айдишника пользователя internalChatId
// если такого нет, я создаю такой чат с internalId где использую 2 айдишника мой и пользователя, сортирую их и соеденияю в строку
// когда я запрашиваю сообщения по чат айди 123 я под капотом пформирую снова internaId и по нему вітаскиваю все сообщения.
// если я отправляю сообщение в чат айти где начало с - тогда я достаю чат по простому айдишнику из монги
// и вітаскиваю сообщения по полю именно чат айди, а не internalId
//
//
//
//
