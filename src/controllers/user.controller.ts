import { Request, Response } from 'express';
import validator from 'validator';

import { APP_HOST } from '../config/config';
import AppReport from '../database/models/appReport.model';
import Role from '../database/models/role.model';
import User from '../database/models/user.model';
import { sendMail } from '../services/nodemailer';

const userController: any = {};

userController.users = async (
    _req: Request,
    res: Response
): Promise<Response> => {
    try {
        const users = await User.find({}).populate('roles').select(
            '-hash -salt');
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

userController.me = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const user = await User.findById((<any>req).user.id).populate(
            'roles',
            '-hash -salt'
        );
        return res.status(200).json({
            data: user ? user.toAuthJSON() : [],
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
        console.log(req.query);
        const { userOrEmail, password } = req.query;

        if (!userOrEmail || !password) {
            return res.status(401).json({
                error: 'Missing fields',
            });
        }

        let user;

        if (validator.isEmail(userOrEmail as string)) {
            user = await User.findOne({
                email: userOrEmail as string,
            }).populate('roles', '-hash -salt');
        } else {
            user = await User.findOne({
                username: userOrEmail as string,
            }).populate('roles', '-hash -salt');
        }

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        if (!user.validatePassword(password as string)) {
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

        if (password.length < 8) {
            return res.json({
                error: 'Password must be at least 8 characters',
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

userController.forgetPassword = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(401).json({
                error: 'Missing fields',
            });
        }

        if (!validator.isEmail(email)) {
            return res.json({
                error: 'Email must be valid',
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        const token = user.generateJWT();

        sendMail(
            user.email,
            'Password Reset',
            `
            <p>You requested a password reset</p>
            <p>Click this <a href="${APP_HOST}/ResetPassword/${token}">link</a> to reset your password</p>
        `
        );

        await user.save();

        return res.status(200).json({
            message: 'Reset Password Sent, check your email',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

userController.resetPassword = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(401).json({
                error: 'Missing fields',
            });
        }

        if (typeof password !== 'string') {
            return res.status(401).json({
                error: 'Password must be a string',
            });
        }

        if (password.length < 8) {
            return res.status(401).json({
                error: 'Password must be at least 8 characters',
            });
        }

        const user = await User.findById((<any>req).user.id);

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        user.setPassword(password);

        await user.save();

        sendMail(
            user.email,
            'Password Reset',
            `
            <p>Your password has been reset</p>
            <p>You can now login with your new password</p>
        `
        );

        return res.status(200).json({
            message: 'Password reset',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

userController.getRoles = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(401).json({
                error: 'Missing fields',
            });
        }

        if (!validator.isMongoId(userId)) {
            return res.json({
                error: 'Invalid fields type',
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        return res.status(200).json({
            message: 'User roles',
            data: user.roles,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

userController.updateRoles = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { userId, roles } = req.body;

        if (!userId || !roles) {
            return res.status(401).json({
                error: 'Missing fields',
            });
        }

        if (!validator.isMongoId(userId) || !Array.isArray(roles)) {
            return res.json({
                error: 'Invalid fields type',
            });
        }

        const user = await User.findById(userId).select('-hash -salt');

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        // eslint-disable-next-line consistent-return
        roles.map(async (role) => {
            if ((await Role.findById(role)) === null) {
                return res.status(404).json({
                    error: `Role not found ${role}`,
                });
            }
        });

        user.roles = roles;

        await user.save();

        return res.status(200).json({
            message: 'User Roles Updated',
            data: user,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

userController.createAppReport = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { title, description, imagePath } = req.body;

        if (!title || !description) {
            return res.status(401).json({
                error: 'Missing fields',
            });
        }

        if (
            typeof title !== 'string' ||
            typeof description !== 'string' ||
            (imagePath && !validator.isURL(imagePath))
        ) {
            return res.json({
                error: 'Invalid fields type',
            });
        }

        const newAppReport = new AppReport({
            title,
            description,
            imagePath,
            author: (<any>req).user.id,
        });

        await newAppReport.save();

        return res.status(201).json({
            message: 'App Report Created',
            data: newAppReport,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

export default userController;
