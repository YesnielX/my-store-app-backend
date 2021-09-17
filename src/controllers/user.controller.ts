import express from 'express';
import validator from 'validator';

import { User } from '../database/models/user.model';

const userController: any = {};

userController.users = async (
    req: express.Request,
    res: express.Response
): Promise<express.Response> => {
    try {
        const users = await User.find({}).select('-hash -salt');
        return res.json({
            data: users,
        });
    } catch (error) {
        console.log(error);
        return res.json({
            error: 'Internal Error',
        });
    }
};

userController.login = async (
    req: express.Request,
    res: express.Response
): Promise<express.Response> => {
    try {
        console.log(req.body);
        const { userOrEmail, password } = req.body;

        let user;

        if (validator.isEmail(userOrEmail)) {
            user = await User.findOne({ email: userOrEmail }).select(
                '+hash +salt'
            );
        } else {
            user = await User.findOne({ username: userOrEmail }).select(
                '+hash +salt'
            );
        }

        if (!user) {
            return res.json({
                error: 'User not found',
            });
        }
        if (!user.validatePassword(password)) {
            return res.json({
                error: 'Password is invalid',
            });
        }
        return res.json({
            data: user.toAuthJSON(),
        });
    } catch (error) {
        console.log(error);
        return res.json({
            error: 'Internal Error',
        });
    }
};

userController.register = async (
    req: express.Request,
    res: express.Response
): Promise<express.Response> => {
    try {
        console.log(req.body);

        const { username, email, password } = req.body;
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

        return res.json({
            message: 'User Register Completed.',
            data: newUser.toAuthJSON(),
        });
    } catch (error: any) {
        console.log(error.message);
        if (error.message.includes('is already taken')) {
            return res.json({
                error: 'Username or Email already exists.',
            });
        }
        return res.json({
            error: 'Internal Error',
        });
    }
};

export default userController;
