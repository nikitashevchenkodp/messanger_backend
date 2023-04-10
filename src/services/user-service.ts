import ApiError from '../exceptions/api-error';
import User from '../schemas/User';
import bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import mailService from './mail-service';
import UserDto from '../dtos/user-dto';
import tokenService from './token-service';

class UserService {
  createUser = async (email: string, password: string, nickname: string, fullName: string) => {
    const potintialUser = await User.findOne({ email });

    if (potintialUser) {
      throw ApiError.AlreadyExist(`User with email "${email}"`);
    }

    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = v4();
    const user = await User.create({ email, password: hashPassword, fullName, nickname });

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ id: userDto._id, ...userDto });
    await tokenService.saveToken(userDto._id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  };

  login = async (email: string, password: string) => {
    const user = await User.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest('Incorrect data');
    }
    const isPasswordequals = await bcrypt.compare(password, user.password);
    if (!isPasswordequals) {
      throw ApiError.BadRequest('Incorrect data');
    }
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ id: userDto._id, ...userDto });
    await tokenService.saveToken(userDto._id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  };

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }

    const userData = tokenService.validateRefreshToken(refreshToken) as any;
    const tokenFromDb = await tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }
    const user = await User.findOne({ _id: userData._id });
    const userDto = new UserDto(user!);
    const tokens = tokenService.generateTokens({ id: userDto._id, ...userDto });
    await tokenService.saveToken(userDto._id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  deleteUser = async () => {};

  getUser = async () => {};

  getAllUsers = async () => {};
}

export const userService = new UserService();
