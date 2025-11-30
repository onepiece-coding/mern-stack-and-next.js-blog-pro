import { Schema, model, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  user: Types.ObjectId;
  title: string;
}
// Category Schema
const CategorySchema = new Schema<ICategory>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  { timestamps: true },
);

// Category Model
export default model<ICategory>('Category', CategorySchema);
