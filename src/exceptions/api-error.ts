export default class ApiError extends Error {
  status: number;
  errors: unknown[];

  constructor(status: number, message: string, errors?: any) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static UnauthorizedError() {
    return new ApiError(401, 'User is unauthorized');
  }
  static NotFoundError(message: string) {
    return new ApiError(404, `${message} not found`);
  }
  static BadRequest(message: string, errors = []) {
    return new ApiError(400, message, errors);
  }
  static AlreadyExist(message: string, errors = []) {
    return new ApiError(409, `${message} already exist`);
  }
}
