// src/models/TodoModel.js
import mongoose from 'mongoose'

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, '标题不能为空'],
      trim: true,
      maxlength: [100, '标题不能超过100个字符'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, '描述不能超过500个字符'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

todoSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Todo = mongoose.model('Todo', todoSchema);
export default Todo