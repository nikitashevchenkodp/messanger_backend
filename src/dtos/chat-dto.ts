import { IChatSchema } from './../schemas/Chat';

export default class ChatDto<T extends IChatSchema> {
  chatId;
  title;
  avatar;
  type;
  members;
  lastMsgId;

  constructor(model: T) {
    this.chatId = model.internalId;
    this.type = model.type;
    this.avatar = model.avatar;
    this.title = model.title;
    this.members = model.members.map((member) => member.toString());
    this.lastMsgId = model.messages?.pop()?.toString();
  }
}
