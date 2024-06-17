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
        const { id } = req.params;
        const existMovies = await User.aggregate([
        [
            {
                $match: {
                    _id: Types.ObjectId.createFromHexString(id),
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    genre: 1,
                    year: 1,
                    desc: 1,
                    rating: 1,
                    review: 1,
                    photo: 1,
                    watched: 1,
                },
            },
        ],
        ]);
        if (!existUser.length) {
        const error = new Error('User not found');
        error.status = 422;
        throw error;
        }

        const imageUrl = await generatePresignedUrl(AWS_Bucket_Name, existUser[0]?.photo, Exp);

        if(imageUrl){
          existUser[0].photo = imageUrl;
        }

        res.status(200).json({ message: 'User Fetched', user: existUser[0] });

    } catch (error) {
        if(!error.status){
            error.status = 500;
        }
        next(error);
    }
}
