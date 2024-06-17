import { Router } from 'express';
import { createMovie } from '../controller/movie.js';

const router = Router();

router.post('', createMovie);

export default router;