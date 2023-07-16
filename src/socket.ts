import { Server as HttpServer } from 'http';
import { Socket, Server } from 'socket.io';
import { chatService } from './services/chat-service';
import { messageService } from './services/message-service';
import { IChat } from './types';
import * as events from './events';
import { userService } from './services/user-service';
import { isUserId } from './helpers';

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

  getCurretUserId = (socket: Socket) => {
    return this.users[socket.id];
  };

  StartListeners = async (socket: Socket) => {
    await this.connect(socket);
    socket.on(events.REQUEST_MESSAGE, (message, cb) => this.messageRecieved(message, socket, cb));
    socket.on(events.TYPING_ON, (data) => this.typing(data, socket));
    socket.on(events.DISCONECTED, () => this.disconnect(socket));
    socket.on('deleteMessage', (data) => this.deleteMessages(data, socket));
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
        let roomName;
        if (chat.type === 'privat') roomName = chat.internalId;
        else roomName = chat._id.toString();
        socket.join(roomName);
      });
    }
    const onlineUsers = Array.from(new Set(Object.values(this.users))).filter((id) => id !== userId);

    this.io.to(socket.id).emit(events.ONLINE_USERS, onlineUsers);
    this.io.except(socket.id).emit('newUserConnected', { userId });
  };

  messageRecieved = async (message: any, socket: Socket, cb?: (...args: any[]) => void) => {
    const { from, content, chatId } = message;
    const isPrivatMessage = isUserId(chatId);

    try {
      if (isPrivatMessage) {
        console.log('is privat');
        console.log('message', message);

        const internalChatId = chatService.transformToInternalChatId(chatId, from.id);
        const createdMessage = await messageService.createMessage(from, content, chatId, internalChatId);
        const room = this.io.sockets.adapter.rooms.get(createdMessage.internalChatId);
        const recieverSocketIds = Object.entries(this.users).filter((user) => user[1] === message.chatId);
        const senderSocketId = socket.id;
        const messageForSender = createdMessage.toJSON();
        const messageForReciever = {
          id: createdMessage.toJSON()._id,
          ...createdMessage.toJSON(),
          chatId: from.id,
        };
        console.log(messageForReciever);

        if (!room) {
          socket.join(createdMessage.internalChatId);
        }
        console.log('recieverSocketIds', recieverSocketIds);
        console.log('senderSocketId', senderSocketId);
        this.io.to(senderSocketId).emit(events.RESPONSE_MESSAGE, { ...messageForSender, id: messageForSender._id });
        recieverSocketIds.forEach((socketId) =>
          this.io.to(socketId[0]).emit(events.RESPONSE_MESSAGE, messageForReciever)
        );
      } else {
        console.log('no privat');

        const createdMessage = await messageService.createMessage(from.id, content, chatId);
        console.log('createdMessage', createdMessage);

        const room = this.io.sockets.adapter.rooms.get(chatId);
        if (!room) {
          socket.join(createdMessage.chatId.toString());
        }
        this.io
          .to(chatId)
          .emit(events.RESPONSE_MESSAGE, { ...createdMessage.toJSON(), id: createdMessage.toJSON()._id });
      }
      cb?.();
    } catch (error) {}
  };

  connectToRoom = async (chatId: string, socket: Socket) => {
    const currentUserId = this.getCurretUserId(socket);
    const internalId = chatService.transformToInternalChatId(chatId, currentUserId);
    socket.join(internalId);
  };

  typing = (data: any, socket: Socket) => {
    const currentUserId = this.getCurretUserId(socket);
    const { chatId, typing } = data;
    const internalId = chatService.transformToInternalChatId(chatId, currentUserId);
    this.io.to(internalId).emit(events.TYPING_EMIT, { userId: currentUserId, typing });
  };
  deleteMessages = async (data: any, socket: Socket) => {
    const { chatId, messagesIds } = data;
    const currentUserId = this.getCurretUserId(socket);
    const internalId = chatService.transformToInternalChatId(chatId, currentUserId);
    await messageService.deleteMessages(data.messagesIds);

    const recieverSocketIds = Object.entries(this.users).filter((user) => user[1] === chatId);
    const senderSocketId = socket.id;

    this.io.to(senderSocketId).emit('messageDeleted', { chatId: chatId, messagesIds: messagesIds });
    recieverSocketIds.forEach((socketId) =>
      this.io.to(socketId).emit('messageDeleted', { chatId: currentUserId, messagesIds: messagesIds })
    );
  };

  editMessage = async (data: any, socket: Socket) => {
    const editedMessage = await messageService.editMessage(data.messageId, data.text);
    const currentUserId = this.getCurretUserId(socket);
    const recieverSocketIds = Object.entries(this.users).filter((user) => user[1] === data.chatId);
    const senderSocketId = socket.id;

    this.io.to(senderSocketId).emit('messageEdited', { message: editedMessage });
    recieverSocketIds.forEach((socketId) =>
      this.io.to(socketId).emit('messageEdited', { message: { ...editedMessage?.toJSON(), chatId: currentUserId } })
    );
  };
  addReaction = async (data: any, socket: Socket) => {
    const newReactions = await messageService.addReaction(data.messageId, data.reaction);
    const currentUserId = this.getCurretUserId(socket);
    const internalChatId = chatService.transformToInternalChatId(data.chatId, currentUserId);

    const recieverSocketIds = Object.entries(this.users).filter((user) => user[1] === data.chatId);
    const senderSocketId = socket.id;

    recieverSocketIds.forEach((socketId) =>
      this.io.to(socketId).emit('reactionAdded', {
        chatId: currentUserId,
        messageId: data.messageId,
        reactions: newReactions,
      })
    );

    this.io.to(senderSocketId).emit('reactionAdded', {
      chatId: data.chatId,
      messageId: data.messageId,
      reactions: newReactions,
    });
  };
  deleteReaction = async (data: any, socket: Socket) => {
    console.log('delete reaction');

    const deletedReactionId = await messageService.deleteReaction(data.messageId, data.reactionId);
    const currentUserId = this.getCurretUserId(socket);
    const internalChatId = chatService.transformToInternalChatId(data.chatId, currentUserId);
    console.log(deletedReactionId);

    const recieverSocketIds = Object.entries(this.users).filter((user) => user[1] === data.chatId);
    const senderSocketId = socket.id;

    recieverSocketIds.forEach((socketId) =>
      this.io.to(socketId).emit('reactionDeleted', {
        chatId: currentUserId,
        messageId: data.messageId,
        reactionId: deletedReactionId,
      })
    );

    this.io.to(senderSocketId).emit('reactionDeleted', {
      chatId: data.chatId,
      messageId: data.messageId,
      reactionId: deletedReactionId,
    });
  };

  disconnect = async (socket: Socket) => {
    console.log('------------------------------------');
    console.info('Disconnect received from: ' + socket.id);
    console.log('------------------------------------');
    const userId = this.getCurretUserId(socket);
    delete this.users[socket.id];
    const dissconnectFromAllDevices = !Boolean(Object.values(this.users).find((id) => id === userId));
    if (dissconnectFromAllDevices) {
      const { lastTimeOnline } = await userService.setLastOnlineTime(userId);
      this.io.emit('userDisconnected', { userId, lastTimeOnline });
    }
  };
}
