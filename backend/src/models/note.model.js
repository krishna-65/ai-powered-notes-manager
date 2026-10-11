import mongoose from 'mongoose';
import { TITLE_MAX_LENGTH, CONTENT_MAX_LENGTH } from '../constants.js';

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [TITLE_MAX_LENGTH, `Title cannot exceed ${TITLE_MAX_LENGTH} characters`],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      maxlength: [CONTENT_MAX_LENGTH, `Content cannot exceed ${CONTENT_MAX_LENGTH} characters`],
    },
  },
  { timestamps: true },
);

export const Note = mongoose.model('Note', noteSchema);
