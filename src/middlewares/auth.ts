/* eslint-disable consistent-return */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../config/config';

export default (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.headers;
    console.log(req.headers);
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token as string, JWT_SECRET);
        (<any>req).user = decoded;

        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
