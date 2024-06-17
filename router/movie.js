import { Router } from 'express';
import { createMovie, deleteMovie, getMovies, getOneMovie } from '../controller/movie.js';

const router = Router();

router.get('', getMovies);

router.get('/:id', getOneMovie);

router.post('', createMovie);

router.delete('/:movieId', deleteMovie);

export default router;