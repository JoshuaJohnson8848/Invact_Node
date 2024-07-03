import Movie from "../models/movie.js";
import s3 from '../utils/AwsConfig.js';
import { generatePresignedUrl, deleteImage } from '../utils/AwsFunctions.js';
import { v4 as uuidv4 } from 'uuid';
// import { Exp, AWS_Bucket_Name } from '../config/AwsCred.js';

export const createMovie = async(req ,res, next) => {
    try {
        const { title, desc, year, genre, rating, review } = req.body;
        const image  = req.file;

        const newData = await new Movie({
            title: title,
            year: year,
            genre: genre,
            desc: desc,
            rating: rating ? rating : null,
            review: review,
            watched: false
        })

        if(image){
            const params = {
                Bucket: process.env.AWS_Bucket_Name,
                Key: `images/invact/${title}-${year}-${uuidv4()}-${image.originalname}`,
                Body: image.buffer,
                ContentType: image.mimetype
            };
          
            const uKey = await s3.upload(params).promise();

            if(!uKey){
                const error = new Error('Image upload Failed');
                error.status = 422;
                throw error;
            }
          
            newData.photo = await uKey?.Key;
        }


        const created = await newData.save();
        if (!created) {
            const error = new Error('Movies not created');
            error.status = 422;
            throw error;
        }

        res.status(200).json({ message: "Movie Added", isCreated: true })
    } catch (error) {
        if(!error.status){
            error.status = 500;
        }
        next(error);
    }
}

export const getMovies = async(req ,res, next) => {
    try {

        const { status } = req.query;

        let existMovies;

        if(status == 'watched'){
            existMovies = await Movie.aggregate([
                {
                    $match: { watched: true }
                }
            ]);

        } else if(status == 'unwatched'){
            existMovies = await Movie.aggregate([
                {
                    $match: { watched: false }
                }
            ]);
        } else {
            existMovies = await Movie.find();
        }


        if (!existMovies.length) {
            const error = new Error('Movies not found');
            error.status = 422;
            throw error;
        }
        
        for (const movie of existMovies) {
            const imageUrl = await generatePresignedUrl(process.env.AWS_Bucket_Name, movie.photo, process.env.Exp);
            if (imageUrl) {
              movie.photo = imageUrl;
            }
        }

        res.status(200).json({ message: 'Movies Fetched', movies: existMovies });

    } catch (error) {
        if(!error.status){
            error.status = 500;
        }
        next(error);
    }
}

export const getOneMovie = async(req ,res, next) => {
    try {
        const { id } = req.params;
        const existMovie = await Movie.findById(id);

        if (!existMovie) {
        const error = new Error('Movies not found');
        error.status = 422;
        throw error;
        }
        
        const imageUrl = await generatePresignedUrl(process.env.AWS_Bucket_Name, existMovie.photo, process.env.Exp);
        if (imageUrl) {
            existMovie.photo = imageUrl;
        }

        res.status(200).json({ message: 'Movies Fetched', movie: existMovie });

    } catch (error) {
        if(!error.status){
            error.status = 500;
        }
        next(error);
    }
}

export const deleteMovie = async(req, res,next)=>{
    try{
      const { movieId } = req.params;
      const movie = await Movie.findById(movieId);
      
      if(!movie){
          const error = new Error('Movie Not Found');
          error.status = 404;
          throw error;
        }

      const deleted = await deleteImage(process.env.AWS_Bucket_Name, movie.photo);
  
      if(!deleted){
        const error = new Error('Movie Image Delete Failed');
        error.status = 422;
        throw error;
      }

      const deleteMovie = await Movie.findByIdAndDelete(movieId)

      if(!deleteMovie){
        const error = new Error('Movie Delete Failed');
        error.status = 422;
        throw error;
      }
  
      res.status(200).json({message: "Movie Deleted", deleted: true})
  
    }catch(err){
      if (!err.status) {
        err.status = 500;
      }
      next(err);
    }
  }

export const updateMovie = async(req, res, next)=>{
    try{
        const { movieId } = req.params;
        const { title, desc, year, genre, review, rating } = req.body;
        const image = req.file;
        
        const movie = await Movie.findById(movieId);
        
        if(!movie){
            const error = new Error('Movie Not Found');
            error.status = 404;
            throw error;
        }

        movie.title = title;
        movie.desc = desc;
        movie.year = year;
        movie.genre = genre;
        movie.rating = rating;
        movie.review = review;


        if(image){
            const deleted = await deleteImage(process.env.AWS_Bucket_Name, movie.photo);

            if(!deleted){
                const error = new Error('Movie Image Delete Failed');
                error.status = 422;
                throw error;
            }

            const params = {
                Bucket: process.env.AWS_Bucket_Name,
                Key: `images/invact/${title}-${year}-${uuidv4()}-${image.originalname}`,
                Body: image.buffer,
                ContentType: image.mimetype
            };
          
            const uKey = await s3.upload(params).promise();
    
            if(!uKey){
                const error = new Error('Image upload Failed');
                error.status = 422;
                throw error;
            }
          
            movie.photo = uKey?.Key;
        }

        const updated = await movie.save();

        if(!updated){
            const error = new Error('Movie Not Updated');
            error.status = 422;
            throw error;
        }

        res.status(200).json({message: "Movie Updated", isUpdated: true})
    
        }
        catch(err){
            if (!err.status) {
                err.status = 500;
            }
            next(err);
        }
}


export const updateReviewRating = async(req, res,next)=>{
    try{
        const { movieId } = req.params;
        const { rating, review } = req.body;
        
        const movie = await Movie.findById(movieId);
        
        if(!movie){
            const error = new Error('Movie Not Found');
            error.status = 404;
            throw error;
        }

        movie.rating = rating;
        movie.review = review;

        const updated = await movie.save();

        if(!updated){
            const error = new Error('Movie Not Updated');
            error.status = 422;
            throw error;
        }

        res.status(200).json({message: "Movie Updated", isUpdated: true})
    
        }
        catch(err){
            if (!err.status) {
                err.status = 500;
            }
            next(err);
        }
}

export const updateWatched = async(req, res,next)=>{
    try{
        const { movieId } = req.params;
        const { watched } = req.body;
        
        const movie = await Movie.findById(movieId);
        
        if(!movie){
            const error = new Error('Movie Not Found');
            error.status = 404;
            throw error;
        }

        movie.watched = watched;

        const updated = await movie.save();

        if(!updated){
            const error = new Error('Movie Not Updated');
            error.status = 422;
            throw error;
        }

        res.status(200).json({message: "Movie Status Updated", isUpdated: true})
    
        }
        catch(err){
            if (!err.status) {
                err.status = 500;
            }
            next(err);
        }
}