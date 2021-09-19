import path from 'path';

import { v2 as cloudinary } from 'cloudinary';

import {
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME,
} from '../config/config';

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

export const upload = async (file: string) => {
    const result = await cloudinary.uploader.upload(
        path.resolve(file),
        {
            tags: 'example',
        },
        function (err) {
            console.log();
            console.log('** File Upload');
            if (err) {
                console.warn(err);
            }
        }
    );
    return result.secure_url;
};
