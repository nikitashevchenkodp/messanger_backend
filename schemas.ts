import { Socket } from 'socket.io';

type Session = {
  id: string;
  startTime: Date;
  endTime: Date;
  location: string;
  device: string;
};

type User = {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  fallbackEmail?: string;
  password: string;
  chats: string[];
  session: Session[];
};

type Attachment = 'img' | 'video';

type Message = {
  id: string;
  from: string;
  to: string;
  text: string;
  chatId: string;
  createdAt: Date;
  delivered: boolean;
  unreaded: boolean;
  edited: boolean;
  attachment?: {
    media: [{ type: Attachment; src: string }];
  };
};

type ChatListItem = {
  user: User;
  chatId: string;
  lastMessage: {
    text: string;
    createdAt: string;
  };
};

type ContactListItem = {
  user: User;
  chatId: string;
};

// send message to chat id
//    if(!chatid) {
//        use "to" and create new chat id
//    }

// if(!chatId) {
//     create new chat
//     socket.emit('new chat created')
// }
// create meessage
// emit('newMessage')
