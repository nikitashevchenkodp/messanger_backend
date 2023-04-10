import { IUser } from '../types';

export default class UserDto<T extends IUser> {
  email;
  _id;
  nickname;
  fullName;
  avatar;
  constructor(model: T) {
    this.email = model.email;
    this._id = model._id.toString();
    this.nickname = model.nickname;
    this.fullName = model.fullName;
    this.avatar = model.avatar;
  }
}
