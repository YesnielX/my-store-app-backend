/* eslint-disable new-cap */
import { Request, Response } from 'express';
import Formidable, { Fields, File, Files } from 'formidable';

import { upload } from '../services/cloudinary';

const imagesController: any = {};
// eslint-disable-next-line consistent-return
imagesController.upload = async (req: Request, res: Response) => {
    try {
        const form: any = new Formidable.IncomingForm({
            maxFileSize: 20 * 1024 * 1024
        })
        form.parse(req, async (_err: any, _fields: Fields, files: Files) => {
            if (!files) {
                return res.status(400).json({
                    error: 'no files sended'
                })
            }

            return res.status(201).json({
                message: 'Image Upload Success',
                data: await upload((files.image as File).path),
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

export default imagesController;
