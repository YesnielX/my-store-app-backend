import { Request, Response } from 'express';
import validator from 'validator';

import Role from '../database/models/role.model';
import User from '../database/models/user.model';

const adminController: any = {};

// get all admins
adminController.getAdmins = async (
    _req: Request,
    res: Response
): Promise<Response> => {
    try {
        const admins = await User.find({ isAdmin: true });

        return res.status(200).json({
            message: 'Admins retrieved successfully',
            data: admins,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

adminController.adminLogin = async (
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

        if (!user.isAdmin) {
            return res.status(401).json({
                error: 'You are not an administrator',
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

adminController.adminRegister = async (
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

        if ((await User.findOne({ isAdmin: true })) !== null) {
            res.status(403).json({
                message: 'Forbidden, There are already administrators',
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
        if ((await User.findOne({ isAdmin: true })) !== null) {
            return res.json({
                error: 'Only one administrator is allowed to register, ask another one to add as administrator',
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
            isAdmin: true,
        });
        newUser.setPassword(password);

        await newUser.save();

        return res.status(201).json({
            message: 'Admin Register Completed.',
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

adminController.addAdmin = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { userOrEmail } = req.body;

        if (!userOrEmail) {
            return res.status(401).json({
                error: 'Missing fields',
            });
        }

        let user;

        if (!validator.isEmail(userOrEmail)) {
            user = await User.findOne({ username: userOrEmail }).select(
                '-salt -hash'
            );
        } else {
            user = await User.findOne({ email: userOrEmail }).select(
                '-salt -hash'
            );
        }

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        if (user.isAdmin) {
            return res.status(401).json({
                error: 'User is already an admin',
            });
        }

        user.isAdmin = true;

        await user.save();

        return res.status(200).json({
            message: 'User is now an admin',
            data: user,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

adminController.removeAdmin = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { userOrEmail } = req.body;

        if (!userOrEmail) {
            return res.status(401).json({
                error: 'Missing fields',
            });
        }

        let user;

        if (!validator.isEmail(userOrEmail)) {
            user = await User.findOne({ username: userOrEmail }).select(
                '-salt -hash'
            );
        } else {
            user = await User.findOne({ email: userOrEmail }).select(
                '-salt -hash'
            );
        }

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        if (!user.isAdmin) {
            return res.status(401).json({
                error: 'User is not an admin',
            });
        }

        user.isAdmin = false;

        await user.save();

        return res.status(200).json({
            message: 'User is no longer an admin',
            data: user,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

adminController.getRoles = async (
    _req: Request,
    res: Response
): Promise<Response> => {
    try {
        const roles = await Role.find();

        return res.status(200).json({
            message: 'Roles retrieved successfully',
            data: roles,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

adminController.createRole = async (req: Request, res: Response) => {
    try {
        const { roleName, description, permissions } = req.body;

        if (!roleName || !description || !permissions) {
            return res.status(401).json({
                error: 'Missing fields',
            });
        }

        if (
            typeof roleName !== 'string' ||
            typeof description !== 'string' ||
            typeof permissions !== 'object'
        ) {
            return res.status(401).json({
                error: 'Role name must be a string',
            });
        }

        const role = await Role.findOne({ name: roleName });

        if (role) {
            return res.status(403).json({
                error: 'Role already exists',
            });
        }

        if (
            typeof permissions.maxStores !== 'number' ||
            typeof permissions.maxProducts !== 'number' ||
            typeof permissions.maxManagers !== 'number' ||
            typeof permissions.maxEmployees !== 'number'
        ) {
            return res.status(401).json({
                error: 'permissions must be an object with maxStores, maxProducts, maxManagers, maxEmployees as numbers',
            });
        }

        const newRole = new Role({
            name: roleName,
            description,
            permissions,
        });

        await newRole.save();

        return res.status(201).json({
            message: 'Role created successfully',
            data: newRole,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

adminController.updateRole = async (req: Request, res: Response) => {
    try {
        const { roleId, roleName, description, permissions } = req.body;

        if (!roleId || !roleName || !description || !permissions) {
            return res.status(401).json({
                error: 'Missing fields',
            });
        }

        if (
            typeof roleId !== 'string' ||
            typeof roleName !== 'string' ||
            typeof description !== 'string' ||
            typeof permissions !== 'object'
        ) {
            return res.status(401).json({
                error: 'roleId, roleName, description must be a string and permissions an array',
            });
        }

        if (
            typeof permissions.maxStores !== 'number' ||
            typeof permissions.maxProducts !== 'number' ||
            typeof permissions.maxManagers !== 'number' ||
            typeof permissions.maxEmployees !== 'number'
        ) {
            return res.status(401).json({
                error: 'permissions must be an object with maxStores, maxProducts, maxManagers, maxEmployees as numbers',
            });
        }

        const role = await Role.findById(roleId);

        if (!role) {
            return res.status(404).json({
                error: 'Role not found',
            });
        }

        role.name = roleName;
        role.description = description;
        role.permissions = permissions;

        await role.save();

        return res.status(200).json({
            message: 'Role updated successfully',
            data: role,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

adminController.deleteRole = async (req: Request, res: Response) => {
    try {
        const { roleId } = req.body;

        if (!roleId) {
            return res.status(401).json({
                error: 'Missing fields',
            });
        }

        if (typeof roleId !== 'string') {
            return res.status(401).json({
                error: 'Role name must be a string',
            });
        }

        const role = await Role.findById(roleId);

        if (!role) {
            return res.status(404).json({
                error: 'Role not found',
            });
        }

        await Role.findByIdAndDelete(roleId);

        return res.status(200).json({
            message: 'Role deleted successfully',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

export default adminController;