import AWS from 'aws-sdk';
import { AWS_Access_Key, AWS_Secret_Key, Region } from '../config/AwsCred.js';

AWS.config.update({
    accessKeyId: AWS_Access_Key,
    secretAccessKey: AWS_Secret_Key,
    region: Region
});

const s3 = new AWS.S3();

export default s3;
