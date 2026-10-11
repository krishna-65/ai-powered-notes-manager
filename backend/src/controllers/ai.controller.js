import { improveNoteContent } from '../services/ai.service.js';
import { CONTENT_MAX_LENGTH } from '../constants.js';

export async function improveNote(req, res) {
  const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';

  if (!content) {
    return res.status(400).json({ success: false, message: 'Content is required' });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Content cannot exceed ${CONTENT_MAX_LENGTH} characters`,
    });
  }

  const improvedContent = await improveNoteContent(content);
  res.json({ success: true, data: { improvedContent } });
}
