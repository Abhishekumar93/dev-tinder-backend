import express, { Request, Response } from 'express';
import { CONFIG_VARS } from './config/env';
import { Server } from 'http';
import { connectDB } from './config/db';
import { gracefulShutdown } from './config/shutdown';
import User from './models/user';
import {
  IApiListResponse,
  IApiResponse,
  IEmail,
  ISignup,
  UserDetails,
} from './interfaceAndTypes';
import { ObjectId } from 'mongoose';

const app = express();

const { PORT } = CONFIG_VARS;

let server: Server | undefined;

app.use(express.json());

app.post(
  '/api/signup',
  async (req: Request<{}, {}, ISignup>, res: Response) => {
    const { email } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = new User(req.body);
      await user.save();

      res.json({ message: 'User created successfully', user });
    } catch (error) {
      return res.status(500).json({ message: 'Something went wrong' });
    }
  }
);

app.get(
  '/api/user',
  async (
    req: Request<{}, {}, IEmail>,
    res: Response<IApiResponse<UserDetails>>
  ) => {
    const email = req.body.email;

    try {
      const user: UserDetails | null = await User.findOne({ email }).select(
        '-password -otp -createdAt -updatedAt -__v'
      );
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User found', data: user });
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong' });
    }
  }
);

app.get(
  '/api/users-list',
  async (_req: Request, res: Response<IApiListResponse<UserDetails[]>>) => {
    try {
      const users: UserDetails[] = await User.find()
        .select('-password -otp -createdAt -updatedAt -__v')
        .sort({ createdAt: -1 });

      res.json({
        message: 'Users list retrieved successfully',
        data: { count: users.length, records: users },
      });
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong' });
    }
  }
);
app.delete(
  '/api/user',
  async (
    req: Request<{}, {}, { userId: ObjectId }>,
    res: Response<IApiResponse<UserDetails>>
  ) => {
    try {
      const { userId } = req.body;
      const user = await User.findByIdAndDelete(userId);

      if (!user) {
        return res
          .status(404)
          .json({ message: 'Delete failed: User not found' });
      }

      res.json({
        message: 'User deleted successfully',
      });
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong' });
    }
  }
);

async function bootstrap(): Promise<void> {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  gracefulShutdown(server, 0);
});

process.on('SIGTERM', () => {
  gracefulShutdown(server, 0);
});

process.on('uncaughtException', (error) => {
  console.error('🔥 Uncaught Exception:', error);
  gracefulShutdown(server, 1);
});

process.on('unhandledRejection', (reason) => {
  console.error('🔥 Unhandled Rejection:', reason);
  gracefulShutdown(server, 1);
});

bootstrap();
