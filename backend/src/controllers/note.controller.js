import { Note } from '../models/note.model.js';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function getNotes(req, res) {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const filter = search ? { title: { $regex: escapeRegex(search), $options: 'i' } } : {};

  // lean() because this query only reads note data.
  const notes = await Note.find(filter).sort({ updatedAt: -1 }).lean();
  res.json({ success: true, data: notes });
}

export async function createNote(req, res) {
  const { title, content } = req.body;
  const note = await Note.create({ title, content });
  res.status(201).json({ success: true, data: note });
}

export async function updateNote(req, res) {
  const { title, content } = req.body;
  const note = await Note.findByIdAndUpdate(
    req.params.id,
    { title, content },
    { new: true, runValidators: true },
  );

  if (!note) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }
  res.json({ success: true, data: note });
}

export async function deleteNote(req, res) {
  const note = await Note.findByIdAndDelete(req.params.id);

  if (!note) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }
  res.json({ success: true, data: { id: note.id } });
}
