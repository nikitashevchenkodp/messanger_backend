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
    console.log('------------------------------------');
    console.info('Connect received from: ' + socket.id);
    console.log('------------------------------------');
    const userId = socket.handshake.query.id as string;
    this.users[socket.id] = userId;
    console.log(this.users);
    const connectedUser = await User.findById(userId);

    if (connectedUser) {
      connectedUser.chats.forEach(async (chat: IChat) => {
        const roomName = chat._id.valueOf() as string;
        socket.join(roomName);
      });
    }

    socket.on('sendMessage', (message) => {
      this.io.to(message.chatId).emit('recMsg', message);
    });

    socket.on('typing', (data) => {
      const userId = this.users[socket.id];
      const { chatId, status } = data;
      this.io.to(chatId).emit('typing', { userId, status });
    });

    socket.on('disconnect', () => {
      console.log('------------------------------------');
      console.info('Disconnect received from: ' + socket.id);
      console.log('------------------------------------');
      delete this.users[socket.id];
      console.log(this.users);
    });
  };
}
