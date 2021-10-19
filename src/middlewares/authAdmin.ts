/* eslint-disable consistent-return */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../config/config';
import User from '../database/models/user.model';

export default async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.headers;

    if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token as string, JWT_SECRET);
        (<any>req).user = decoded;

        if (
            !(await User.findOne({ _id: (<any>req).user.id }))?.isAdmin &&
            !(await User.findOne({ _id: (<any>req).user.id }))?.isPrincipalAdmin
        ) {
            return res.status(403).json({
                error: 'You are not allowed to do this action, admin Only',
            });
        }

        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};
