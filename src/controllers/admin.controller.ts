import { Request, Response } from 'express';
import validator from 'validator';

import appReportModel from '../database/models/appReport.model';
import Role from '../database/models/role.model';
import User from '../database/models/user.model';

const adminController: any = {};

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

        if (!user.isAdmin && !user.isPrincipalAdmin) {
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

adminController.addAdmin = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { userOrEmail } = req.body;

        if (!(await User.findById((<any>req).user.id))?.isPrincipalAdmin) {
            return res.status(401).json({
                error: 'You are not an principal administrator',
            });
        }

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

        if (!(await User.findById((<any>req).user.id))?.isPrincipalAdmin) {
            return res.status(401).json({
                error: 'You are not an principal administrator',
            });
        }

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

adminController.getAppReports = async (
    _req: Request,
    res: Response
): Promise<Response> => {
    try {
        const reports = await appReportModel.find();

        return res.status(200).json({
            message: 'Reports retrieved successfully',
            data: reports,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

// delete AppReport function
adminController.deleteAppReport = async (req: Request, res: Response) => {
    try {
        const { reportId } = req.body;

        if (!reportId) {
            return res.status(401).json({
                error: 'Missing fields',
            });
        }

        if (!validator.isMongoId(reportId)) {
            return res.status(401).json({
                error: 'reportId must be a string',
            });
        }

        const report = await appReportModel.findById(reportId);

        if (!report) {
            return res.status(404).json({
                error: 'Report not found',
            });
        }

        await appReportModel.findByIdAndDelete(reportId);

        return res.status(200).json({
            message: 'Report deleted successfully',
            data: report,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

adminController.appReportResolved = async (req: Request, res: Response) => {
    try {
        const { reportId } = req.body;

        if (!reportId) {
            return res.status(401).json({
                error: 'Missing fields',
            });
        }

        if (!validator.isMongoId(reportId)) {
            return res.status(401).json({
                error: 'reportId must be a string',
            });
        }

        const report = await appReportModel.findById(reportId);

        if (!report) {
            return res.status(404).json({
                error: 'Report not found',
            });
        }

        if (report.solved) {
            return res.status(403).json({
                error: 'Report already resolved',
            });
        }

        report.solved = true;

        await report.save();

        return res.status(200).json({
            message: 'Report resolved successfully',
            data: report,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

export default adminController;
