import { Schema, model, Document, Types } from 'mongoose';

export interface IVerificationToken extends Document {
  userId: Types.ObjectId;
  token: string;
}
// Verification Token Schema
const VerificationTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Verificaton Token Model
export default model<IVerificationToken>(
  'VerificationToken',
  VerificationTokenSchema,
);
