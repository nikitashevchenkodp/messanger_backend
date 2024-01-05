import { IMessageSchema } from '../schemas/Message';

export default class MessageDto<T extends IMessageSchema> {
  id;
  content;
  chatId;
  from;
  edited;
  createdAt;
  reactions;
  sentStatus;
  status;

  constructor(model: T) {
    this.id = model._id.toString();
    this.chatId = model.chatId.toString();
    this.from = {
      id: model.from.id.toString(),
      fullName: model.from.fullName,
      avatar: model.from.avatar,
    };
    this.content = model.content;
    this.edited = model.edited;
    this.createdAt = model.createdAt;
    this.reactions = model.reactions;
    this.sentStatus = model.sentStatus;
    this.status = model.status;
  }
}

export class PrivatMessageDto<T extends IMessageSchema> {
  internalChatId;
  id;
  content;
  chatId;
  from;
  edited;
  createdAt;
  reactions;
  sentStatus;
  status;

  constructor(model: T) {
    this.internalChatId = model.internalChatId;
    this.id = model._id.toString();
    this.chatId = model.chatId.toString();
    this.from = {
      id: model.from.id.toString(),
      fullName: model.from.fullName,
      avatar: model.from.avatar,
    };
    this.content = model.content;
    this.edited = model.edited;
    this.createdAt = model.createdAt;
    this.reactions = model.reactions;
    this.sentStatus = model.sentStatus;
    this.status = model.status;
  }
}
