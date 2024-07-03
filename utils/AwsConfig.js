import AWS from 'aws-sdk';
import { AWS_Access_Key, AWS_Secret_Key, Region } from '../config/AwsCred.js';

AWS.config.update({
    accessKeyId: process.env.AWS_Access_Key,
    secretAccessKey: process.env.AWS_Secret_Key,
    region: process.env.Region
});

const s3 = new AWS.S3();

export default s3;
