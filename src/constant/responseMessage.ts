export const RESPONSE_MESSAGE = {
  USER_REGISTERED: 'User registered successfully',
  USER_ALREADY_EXISTS: 'User already exists!',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_LOGGED_IN: 'User logged in successfully',
  USER_LOGGED_OUT: 'User logged out successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  INVALID_TOKEN: 'Invalid token',
  UNAUTHORIZED: 'Unauthorized',
  NOT_FOUND: 'Not found',
  TOKEN_EXPIRED: 'Token expired',
  AUTHENTICATION_FAILED: 'Authentication failed',
  PASSWORD_OR_OTP_REQUIRED: 'Password or OTP is required for login',
  PASSWORD_OTP_REQUIRED: 'Provide either password or OTP, not both',
  usernameTaken: (username: string) =>
    `Username ${username} is already taken. Please provide another username`,
};
