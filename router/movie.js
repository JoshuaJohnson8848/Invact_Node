import { Router } from 'express';
import { createMovie, getMovies, getOneMovie } from '../controller/movie.js';

const router = Router();

router.get('', getMovies);

router.get('/:id', getOneMovie);

router.post('', createMovie);

export default router;