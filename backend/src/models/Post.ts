import { Schema, model, Document, Types } from 'mongoose';
import { IImage } from './User.js';

export interface IPost extends Document {
  title: string;
  description: string;
  user: Types.ObjectId;
  categoryId: Schema.Types.ObjectId;
  image: IImage | { url: string; publicId?: string | null };
  likes: Types.ObjectId[];
}

// Post Schema
const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    image: {
      type: Object,
      default: {
        url: '',
        publicId: null,
      },
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// text index for full-text search
PostSchema.index({ title: 'text', description: 'text' });

// Populate Comments For This Post
PostSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'postId',
  localField: '_id',
});

// Post Model
export default model<IPost>('Post', PostSchema);
