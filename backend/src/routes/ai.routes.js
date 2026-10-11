import { Router } from 'express';
import { improveNote } from '../controllers/ai.controller.js';

const router = Router();

router.post('/improve-note', improveNote);

export default router;
