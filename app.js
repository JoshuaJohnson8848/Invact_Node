import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import multer from 'multer';
import bodyParser from 'body-parser';
import AWS from 'aws-sdk';

export const app = express();

import movieRouter  from './router/movie.js';

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config({ path: './config/.env' });

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS,GET,POST,PUT,PATCH,DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(multer().single('image'));

app.use('',movieRouter);

app.use((error, req, res, next) => {
  const data = error.data;
  const message = error.message;
  const status = error.status || 500;
  res.status(status).json({ message: message, data: data });
  next();
});

AWS.config.update({
    accessKeyId: process.env.AWS_Access_Key,
    secretAccessKey: process.env.AWS_Secret_Key,
    region: process.env.Region
});

export const s3 = new AWS.S3();

mongoose
  .connect(process.env.MONGO_URI)
  .then((result) => {
    app.listen(process.env.PORT, (req, res, next) => {
      console.log(`Server is Running At PORT ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
