import { Server as HttpServer } from 'http';
import { Socket, Server } from 'socket.io';
import User from './schemas/User';
import { IChat } from './types';

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
    socket.on('sendMessage', this.sendMessage);
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

  sendMessage = (message: any) => {
    this.io.to(message.chatId).emit('recMsg', message);
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
