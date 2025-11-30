import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
  postId: Types.ObjectId;
  user: Types.ObjectId;
  text: string;
  username: string;
}

// Comment Schema
const CommentSchema = new Schema<IComment>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// Comment Model
export default model<IComment>('Comment', CommentSchema);
