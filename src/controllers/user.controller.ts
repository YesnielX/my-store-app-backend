import { Request, Response } from 'express';
import validator from 'validator';

import User from '../database/models/user.model';

const userController: any = {};

userController.users = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const users = await User.find({}).select('-hash -salt');
        return res.status(200).json({
            data: users,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

userController.login = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        console.log(req.body);
        const { userOrEmail, password } = req.body;

        if (!userOrEmail || !password) {
            return res.status(401).json({
                error: 'Missing fields',
            });
        }

        let user;

        if (validator.isEmail(userOrEmail)) {
            user = await User.findOne({ email: userOrEmail });
        } else {
            user = await User.findOne({ username: userOrEmail });
        }

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }
        if (!user.validatePassword(password)) {
            return res.status(401).json({
                error: 'Password is invalid',
            });
        }
        return res.status(200).json({
            data: user.toAuthJSON(),
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

userController.register = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        console.log(req.body);

        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(401).json({
                error: 'Missing fields',
            });
        }

        // register regexp verify
        const regexp = /^[a-zA-Z0-9]+$/;
        if (!regexp.test(username)) {
            return res.json({
                error: 'Username must be alphanumeric',
            });
        }

        if (!validator.isEmail(email)) {
            return res.json({
                error: 'Email must be valid',
            });
        }

        const newUser = new User({
            username,
            email,
        });
        newUser.setPassword(password);

        await newUser.save();

        return res.status(201).json({
            message: 'User Register Completed.',
            data: newUser.toAuthJSON(),
        });
    } catch (error: any) {
        console.log(error.message);
        if (error.message.includes('is already taken')) {
            return res.status(403).json({
                error: 'Username or Email already exists.',
            });
        }
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

export default userController;
