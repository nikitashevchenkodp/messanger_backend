import { Server as HttpServer } from 'http';
import { Socket, Server } from 'socket.io';
import Chat from './schemas/Chat';
import User from './schemas/User';
import { chatService } from './services/chat-service';
import { messageService } from './services/message-service';
import { IChat } from './types';

const sendMessage = async (message: { from: string; to: string; chatId: string; messageText: string }) => {
  const { from, to, messageText, chatId } = message;
  let chat;
  if (!chatId) {
    chat = await chatService.createChat(from, to);
  } else {
    chat = await Chat.findById(chatId);
  }

  const newMessage = await messageService.createMessage(from, to, messageText, chat ? chat._id.toString() : chatId);
  await messageService.saveMessage(chat ? chat._id.toString() : chatId, newMessage);

  return newMessage;
};

export class ServerSocket {
  public static instance: ServerSocket;
  public io: Server;
  public users: Record<string, string>;

  /** Master list of all connected users */

  constructor(server: HttpServer) {
    ServerSocket.instance = this;
    this.users = {};
    this.io = new Server(server, {
      serveClient: false,
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false,
      cors: {
        origin: '*',
      },
    });

    this.io.on('connection', this.StartListeners);
  }

  StartListeners = async (socket: Socket) => {
    await this.connect(socket);
    socket.on('sendMessage', (message) => this.sendMessage(message, socket));
    socket.on('typing', (data) => this.typing(data, socket));
    socket.on('disconnect', () => this.disconnect(socket));
  };

  connect = async (socket: Socket) => {
    console.log('------------------------------------');
    console.info('Connect received from: ' + socket.id);
    console.log('------------------------------------');
    const userId = socket.handshake.query.id as string;
    this.users[socket.id] = userId;
    const connectedUser = await User.findById(userId);
    if (connectedUser) {
      connectedUser.chats.forEach(async (chat: IChat) => {
        const roomName = chat._id.valueOf() as string;
        socket.join(roomName);
      });
    }
    const onlineUsers = Array.from(new Set(Object.values(this.users)));
    this.io.emit('online', onlineUsers);
  };

  sendMessage = async (message: any, socket: Socket) => {
    const createdMessage = await sendMessage(message);
    const room = this.io.sockets.adapter.rooms.get(createdMessage.chatId.toString());
    if (!room) {
      socket.join(createdMessage.chatId.toString());
    }
    if (!message.chatId) {
      const socketId = Object.entries(this.users).find((user) => user[1] === message.to)?.[0] || '';
      this.io.to(socketId).emit('messageFromNewContact');
      this.io.to(socket.id).emit('newChatCreated', createdMessage.chatId);
    }
    this.io.to(message.chatId).emit('recMsg', createdMessage);
  };

  typing = (data: any, socket: Socket) => {
    const userId = this.users[socket.id];
    const { chatId, typing } = data;
    this.io.to(chatId).emit('typing', { userId, typing });
  };

  disconnect = (socket: Socket) => {
    console.log('------------------------------------');
    console.info('Disconnect received from: ' + socket.id);
    console.log('------------------------------------');
    delete this.users[socket.id];
    const onlineUsers = Array.from(new Set(Object.values(this.users)));
    this.io.emit('online', onlineUsers);
  };
}
