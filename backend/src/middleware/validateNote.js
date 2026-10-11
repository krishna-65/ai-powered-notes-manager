import { TITLE_MAX_LENGTH, CONTENT_MAX_LENGTH } from '../constants.js';

function asTrimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateNote(req, res, next) {
  const title = asTrimmedString(req.body?.title);
  const content = asTrimmedString(req.body?.content);

  if (!title) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }
  if (!content) {
    return res.status(400).json({ success: false, message: 'Content is required' });
  }
  if (title.length > TITLE_MAX_LENGTH) {
    return res.status(400).json({ success: false, message: `Title cannot exceed ${TITLE_MAX_LENGTH} characters` });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    return res.status(400).json({ success: false, message: `Content cannot exceed ${CONTENT_MAX_LENGTH} characters` });
  }

  req.body = { title, content };
  next();
}
