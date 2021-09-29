/* eslint-disable new-cap */
import { Request, Response } from 'express';
import Formidable, { Fields, File, Files } from 'formidable';

import { upload } from '../services/cloudinary';

const imagesController: any = {};
// eslint-disable-next-line consistent-return
imagesController.upload = async (req: Request, res: Response) => {
    try {
        const form: any = new (Formidable as any)({
            maxFileSize: 20 * 1024 * 1024,
        });

        form.parse(req, async (_err: any, _fields: Fields, files: Files) => {
            return res.status(201).json({
                message: 'Image Upload Success',
                data: await await upload((files.image as File).path),
            });
        });
    } catch (error) {
        console.log(error);
        return res.json({
            error: 'Internal Error',
        });
    }
};

export default imagesController;
