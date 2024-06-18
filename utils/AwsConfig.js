import AWS from 'aws-sdk';
import dotenv from 'dotenv';
// import { AWS_Access_Key, AWS_Secret_Key, Region } from '../config/AwsCred.js';

dotenv.config({ path: '../config/.env' });

AWS.config.update({
    accessKeyId: process.env.AWS_Access_Key,
    secretAccessKey: process.env.AWS_Secret_Key,
    region: process.env.Region
});

// console.log('AWS_Access_Key:', process.env.AWS_Access_Key);
// console.log('AWS_Secret_Key:', process.env.AWS_Secret_Key);
// console.log('AWS_Bucket_Name:', process.env.AWS_Bucket_Name);
// console.log('Region:', process.env.Region);
// console.log('Exp:', process.env.Exp);

const s3 = new AWS.S3();

export default s3;
