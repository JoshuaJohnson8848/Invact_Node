import mongoose, { Schema } from 'mongoose';

const movieSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    review: {
        type: String,
        required: true,
    },
    watched: {
        type: Boolean,
        required: true,
        default: false
    },
    photo: {
        type: String,
    }
})

export default mongoose.model("Movie", movieSchema);