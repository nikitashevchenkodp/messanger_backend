import { Server as HttpServer } from 'http';
import { Socket, Server } from 'socket.io';
import Chat from './schemas/Chat';
import User from './schemas/User';
import { chatService } from './services/chat-service';
import { messageService } from './services/message-service';
import { IChat } from './types';
import * as events from './events';

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

    this.io.on(events.CONNECTION, this.StartListeners);
  }

  StartListeners = async (socket: Socket) => {
    await this.connect(socket);
    socket.on(events.REQUEST_MESSAGE, (message) => this.messageRecieved(message, socket));
    socket.on(events.TYPING_ON, (data) => this.typing(data, socket));
    socket.on(events.DISCONECTED, () => this.disconnect(socket));
    socket.on('deleteMessage', (data) => this.deleteMessage(data, socket));
    socket.on('editMessage', (data) => this.editMessage(data, socket));
    socket.on('addReaction', (data) => this.addReaction(data, socket));
    socket.on('deleteReaction', (data) => this.deleteReaction(data, socket));
    socket.on('connectToNewChat', (data) => this.connectToRoom(data, socket));
  };

  connect = async (socket: Socket) => {
    console.log('------------------------------------');
    console.info('Connect received from: ' + socket.id);
    console.log('------------------------------------');
    const userId = socket.handshake.query.id as string;
    this.users[socket.id] = userId;
    const chats = await chatService.getAllChats(userId);
    if (chats) {
      chats.forEach(async (chat: IChat) => {
        const roomName = chat._id.valueOf() as string;
        socket.join(roomName);
      });
    }
    const onlineUsers = Array.from(new Set(Object.values(this.users)));
    this.io.emit(events.ONLINE_USERS, onlineUsers);
  };

  messageRecieved = async (message: any, socket: Socket) => {
    console.log(message);
    const { from, to, text, chatId } = message;
    const createdMessage = await messageService.createMessage(from, to, text, chatId);
    const room = this.io.sockets.adapter.rooms.get(createdMessage.chatId.toString());
    if (!room) {
      socket.join(createdMessage.chatId.toString());
      const socketId = Object.entries(this.users).find((user) => user[1] === message.to)?.[0] || '';
      this.io.to(socketId).emit(events.MESSAGE_FROM_NEW_CONTACT, createdMessage.chatId);
      this.io.to(socket.id).emit(events.NEW_CHAT_CREATED, createdMessage.chatId);
    }
    this.io.to(message.chatId).emit(events.RESPONSE_MESSAGE, createdMessage);
  };

  connectToRoom = async (chatId: string, socket: Socket) => {
    socket.join(chatId);
  };

  typing = (data: any, socket: Socket) => {
    const userId = this.users[socket.id];
    const { chatId, typing } = data;
    this.io.to(chatId).emit(events.TYPING_EMIT, { userId, typing });
  };
  deleteMessage = async (data: any, socket: Socket) => {
    await messageService.deleteMessage(data.message._id);
    this.io.to(data.message.chatId).emit('messageDeleted', { message: data.message });
  };

  editMessage = async (data: any, socket: Socket) => {
    console.log('edit message server', data);
    const editedMessage = await messageService.editMessage(data.messageId, data.text);
    console.log('edited message', editedMessage);

    this.io.to(editedMessage!.chatId.toString()).emit('messageEdited', { message: editedMessage });
  };
  addReaction = async (data: any, socket: Socket) => {
    const messageWithReaction = await messageService.addReaction(data.messageId, data.reaction);
    this.io.to(data.chatId).emit('reactionAdded', {
      chatId: data.chatId,
      messageId: data.messageId,
      reactions: messageWithReaction?.reactions || [],
    });
  };
  deleteReaction = async (data: any, socket: Socket) => {
    const messageWithReaction = await messageService.deleteReaction(data.messageId, data.reactionId);
    console.log(messageWithReaction);

    this.io.to(messageWithReaction?.chatId.toString() || '').emit('reactionDeleted', {
      chatId: messageWithReaction?.chatId,
      messageId: data.messageId,
      reactions: messageWithReaction?.reactions || [],
    });
  };

  disconnect = (socket: Socket) => {
    console.log('------------------------------------');
    console.info('Disconnect received from: ' + socket.id);
    console.log('------------------------------------');
    delete this.users[socket.id];
    const onlineUsers = Array.from(new Set(Object.values(this.users)));
    this.io.emit(events.ONLINE_USERS, onlineUsers);
  };
}
