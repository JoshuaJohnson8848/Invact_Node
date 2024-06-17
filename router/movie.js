import { Router } from 'express';
import { createMovie, deleteMovie, getMovies, getOneMovie, updateMovie, updateReviewRating, updateWatched } from '../controller/movie.js';

const router = Router();

router.get('', getMovies);

router.get('/:id', getOneMovie);

router.post('', createMovie);

router.put('/:movieId', updateMovie);

router.put('/review/:movieId', updateReviewRating);

router.put('/watched/:movieId', updateWatched);

router.delete('/:movieId', deleteMovie);

export default router;