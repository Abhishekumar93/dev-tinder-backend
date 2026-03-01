import mongoose from 'mongoose';
import { CONNECTION_STATUS, RESPONSE_MESSAGE } from '../constant';
import { IConnectionRequest } from '../interfaceAndTypes';

const { INVALID_CONNECTION_STATUS } = RESPONSE_MESSAGE;
const { Schema } = mongoose;

const connectionRequestSchema = new Schema<IConnectionRequest>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      required: true,
      enum: {
        values: CONNECTION_STATUS,
        message: INVALID_CONNECTION_STATUS,
      },
    },
  },
  { timestamps: true }
);

connectionRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });
connectionRequestSchema.index({ receiver: 1 });

const ConnectionRequestModel = mongoose.model(
  'ConnectionRequest',
  connectionRequestSchema
);

export default ConnectionRequestModel;
