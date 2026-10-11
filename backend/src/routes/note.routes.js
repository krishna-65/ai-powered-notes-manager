import { Router } from 'express';
import { getNotes, createNote, updateNote, deleteNote } from '../controllers/note.controller.js';
import { validateNote } from '../middleware/validateNote.js';

const router = Router();

router.get('/', getNotes);
router.post('/', validateNote, createNote);
router.put('/:id', validateNote, updateNote);
router.delete('/:id', deleteNote);

export default router;
