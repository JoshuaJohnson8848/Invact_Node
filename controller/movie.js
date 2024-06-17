import Movie from "../models/movie.js";
import s3 from '../utils/AwsConfig.js';
import { generatePresignedUrl, deleteImage } from '../utils/AwsFunctions.js';
import { v4 as uuidv4 } from 'uuid';
import { Exp, AWS_Bucket_Name } from '../config/AwsCred.js';

export const createMovie = async(req ,res, next) => {
    try {
        const { title, desc, year, genre, rating, review, watched } = req.body;
        const image  = req.file;

        const newData = await new Movie({
            title: title,
            year: year,
            genre: genre,
            desc: desc,
            rating: rating,
            review: review,
            watched: watched
        })
        console.log(image);

        if(image){
            const params = {
                Bucket: AWS_Bucket_Name,
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
        if(!created){
            throw new Error("Movie not created");
        }

        res.status(200).json({ message: "Movie Added", movie: created })
    } catch (error) {
        if(!error.status){
            error.status = 500;
        }
        next(error);
    }
}

export const getMovies = async(req ,res, next) => {
    try {

        const existMovies = await Movie.find();

        if (!existMovies.length) {
            const error = new Error('Movies not found');
            error.status = 422;
            throw error;
        }
        
        for (const movie of existMovies) {
            const imageUrl = await generatePresignedUrl(AWS_Bucket_Name, movie.photo, Exp);
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
        
        const imageUrl = await generatePresignedUrl(AWS_Bucket_Name, existMovie.photo, Exp);
        if (imageUrl) {
            existMovie.photo = imageUrl;
        }

        res.status(200).json({ message: 'Movies Fetched', movies: existMovie });

    } catch (error) {
        if(!error.status){
            error.status = 500;
        }
        next(error);
    }
}

export const deleteMovie= async(req, res,next)=>{
    try{
      const { movieId } = req.params;
      const movie = await Movie.findById(movieId);
      
      if(!movie){
          const error = new Error('Movie Not Found');
          error.status = 404;
          throw error;
        }

      const deleted = await deleteImage(AWS_Bucket_Name, movie.photo);
  
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