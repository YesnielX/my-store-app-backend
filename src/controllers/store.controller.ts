import { Request, Response } from 'express';
import validator from 'validator';

import Product from '../database/models/product.model';
import Report from '../database/models/productReport.model';
import Store, { IStore } from '../database/models/store.model';
import User from '../database/models/user.model';

const storeController: any = {};

storeController.getStores = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { user } = <any>req;

        const checkAdmin = await User.findById(user.id);

        if (checkAdmin?.isAdmin || checkAdmin?.isPrincipalAdmin) {
            const stores = await Store.find({})
                .populate('author managers employees products', '-salt -hash')
                .populate({
                    path: 'products',
                    populate: {
                        path: 'author',
                        select: '-salt -hash',
                    },
                });

            return res.json({
                message: 'Stores, you are a admin',
                data: stores,
            });
        }

        const stores = await Store.find({ author: user.id })
            .populate('author managers employees products', '-salt -hash')
            .populate({
                path: 'products',
                populate: {
                    path: 'author',
                    select: '-salt -hash',
                },
            });

        const managerStores = await Store.find({
            managers: user.id,
        })
            .populate('author managers employees products', '-salt -hash')
            .populate({
                path: 'products',
                populate: {
                    path: 'author',
                    select: '-salt -hash',
                },
            });

        const employeesStores = await Store.find({
            employees: user.id,
        })
            .populate('author managers employees products', '-salt -hash')
            .populate({
                path: 'products',
                populate: {
                    path: 'author',
                    select: '-salt -hash',
                },
            });

        employeesStores.map((employeeStore) => {
            stores.push(employeeStore);
        });

        return res.json({
            message: 'Stores',
            data: {
                myStores: stores,
                managerStores,
                employeesStores,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

storeController.createStore = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        console.log(req.body);

        const { name, imagePath } = req.body;

        const user = await User.findById((<any>req).user.id).populate('roles');

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        if (!user!.roles.length) {
            return res.status(403).json({
                error: 'Unauthorized, you no have a roles',
            });
        }

        const userRoleWithMaxStores = user?.roles.sort((a, b) => {
            return b.permissions.maxStores - a.permissions.maxStores;
        });

        if (
            userRoleWithMaxStores &&
            userRoleWithMaxStores[0] &&
            userRoleWithMaxStores[0]?.permissions.maxStores ===
                (await Store.find({
                    author: (<any>req).user.id,
                }).countDocuments())
        ) {
            return res.status(403).json({
                error: 'maxStores reached!',
            });
        }

        if (!name || !imagePath) {
            return res.status(400).json({
                error: 'Missing fields',
            });
        }

        if (!validator.isLength(name, { min: 3, max: 30 })) {
            return res.status(400).json({
                error: 'Name must be between 3 and 30 characters',
            });
        }

        if (!validator.isURL(imagePath)) {
            return res.status(400).json({
                error: 'Image path is not valid',
            });
        }

        const newStore = new Store({
            name,
            imagePath,
            author: (<any>req).user.id,
        });
        await newStore.save();

        return res.status(201).json({
            message: 'created',
            data: newStore,
        });
    } catch (error: any) {
        console.log(error);
        if (error.message.includes('is already taken')) {
            return res.status(403).json({
                error: 'Store already exists',
            });
        }
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

storeController.updateStore = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        console.log(req.body);

        const { storeId, name, imagePath } = req.body;

        if (!storeId || !name || !imagePath) {
            return res.status(400).json({
                error: 'Missing fields',
            });
        }

        if (
            !validator.isMongoId(storeId) ||
            typeof name !== 'string' ||
            !validator.isURL(imagePath)
        ) {
            return res.status(400).json({
                error: 'Invalid fields type',
            });
        }

        if (!validator.isLength(name, { min: 3, max: 30 })) {
            return res.status(400).json({
                error: 'Name must be between 3 and 30 characters',
            });
        }
        const store = await Store.findById(storeId);

        if (!store) {
            return res.status(404).json({
                error: 'Store not found',
            });
        }

        if (
            (store as IStore).author.toString() !== (<any>req).user.id &&
            !store.managers.includes((<any>req).user.id) &&
            !(await User.findById((<any>req).user.id))?.isPrincipalAdmin &&
            !(await User.findById((<any>req).user.id))?.isAdmin
        ) {
            return res.status(403).json({
                error: 'Unauthorized, ony store owner, managers or admin',
            });
        }

        store.name = name;
        store.imagePath = imagePath;

        await store.save();

        return res.json({
            message: 'Store updated',
            data: store,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

storeController.deleteStore = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        console.log(req.body);

        const { storeId } = req.body;

        if (!storeId) {
            return res.status(400).json({
                error: 'storeId is required',
            });
        }

        if (!validator.isMongoId(storeId)) {
            return res.status(400).json({
                error: 'Invalid storeId',
            });
        }

        const store = await Store.findById(storeId);

        if (!store) {
            return res.status(404).json({
                error: 'Store not found',
            });
        }

        if (
            (store as IStore).author.toString() !== (<any>req).user.id &&
            !(await User.findById((<any>req).user.id))?.isPrincipalAdmin &&
            !(await User.findById((<any>req).user.id))?.isAdmin
        ) {
            return res.status(403).json({
                error: 'Unauthorized, only owner store or admin',
            });
        }

        store.products.forEach(async (product: any) => {
            await Product.findByIdAndDelete(product);
        });

        await Report.deleteMany({ store: storeId });

        await store.remove();

        return res.json({
            message: 'Store, products and reports deleted',
        });
    } catch (error: any) {
        console.log(error.message);
        return res.json({
            error: 'Internal Error',
        });
    }
};

storeController.getManagers = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { storeId } = <any>req.query;

        if (!storeId) {
            return res.status(400).json({
                error: 'Missing fields',
            });
        }

        if (!validator.isMongoId(storeId)) {
            return res.json({
                error: 'Invalid fields type',
            });
        }

        const store = await Store.findById(storeId).populate('managers');

        return res.json({
            message: 'Managers',
            data: (store as IStore).managers,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

storeController.addManager = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        console.log(req.body);

        const { storeId, userEmail } = req.body;

        if (!storeId || !userEmail) {
            return res.status(400).json({
                error: 'Missing required fields',
            });
        }

        if (!validator.isMongoId(storeId) || !validator.isEmail(userEmail)) {
            return res.status(404).json({
                error: 'Invalid fields type',
            });
        }

        const store = await Store.findById(storeId);

        if (!store) {
            return res.status(404).json({
                error: 'Store not found',
            });
        }

        if ((store as IStore).author.toString() !== (<any>req).user.id) {
            return res.status(403).json({
                error: 'Unauthorized, only store owner',
            });
        }

        const user = await User.findOne({ email: userEmail }).populate('roles');

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        if (store.managers.includes((<any>req).user.id)) {
            return res.status(403).json({
                error: 'StoreOwner Only add managers',
            });
        }

        if (store.managers.includes(user.id)) {
            return res.status(403).json({
                error: 'User already manager',
            });
        }

        const storeOwner = await User.findById((<any>req).user.id).populate(
            'roles'
        );

        if (!storeOwner!.roles.length) {
            return res.status(403).json({
                error: 'Unauthorized, you no have a roles',
            });
        }

        const storeOwnerRoleWithMaxManagers = user?.roles.sort((a, b) => {
            return b.permissions.maxManagers - a.permissions.maxManagers;
        });

        if (
            storeOwnerRoleWithMaxManagers &&
            storeOwnerRoleWithMaxManagers[0] &&
            storeOwnerRoleWithMaxManagers[0]?.permissions.maxManagers ===
                store.managers.length
        ) {
            return res.status(403).json({
                error: 'maxManagers reached!',
            });
        }

        store.managers.push(user.id);

        await store.save();

        return res.status(200).json({
            message: 'Manager Added',
            data: (await store.populate('managers')).managers,
        });
    } catch (error: any) {
        console.log(error.message);
        if (error.message.includes('is already taken')) {
            return res.json({
                error: 'Manager already exists.',
            });
        }
        return res.json({
            error: 'Internal Error',
        });
    }
};

storeController.deleteManager = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        console.log(req.body);

        const { storeId, userId } = req.body;

        if (!storeId || !userId) {
            return res.status(400).json({
                error: 'Missing required fields',
            });
        }

        if (!validator.isMongoId(storeId) || !validator.isMongoId(userId)) {
            return res.status(404).json({
                error: 'Invalid fields type',
            });
        }

        const store = await Store.findById(storeId);

        if (!store) {
            return res.status(404).json({
                error: 'Store not found',
            });
        }

        if ((store as IStore).author.toString() !== (<any>req).user.id) {
            return res.status(403).json({
                error: 'Unauthorized',
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        if (!store.managers.includes(userId)) {
            return res.status(403).json({
                error: 'User not manager',
            });
        }

        await Store.findOneAndUpdate(
            {
                _id: storeId,
            },
            {
                $pull: {
                    managers: userId,
                },
            }
        );

        return res.status(200).json({
            message: 'Manager Deleted',
            data: (await store.populate('managers')).managers,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.json({
            error: 'Internal Error',
        });
    }
};

storeController.getEmployees = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { storeId } = <any>req.query;

        if (!storeId) {
            return res.status(400).json({
                error: 'Missing fields',
            });
        }

        if (!validator.isMongoId(storeId)) {
            return res.json({
                error: 'Invalid fields type',
            });
        }

        const store = await Store.findById(storeId).populate('employees');

        return res.json({
            message: 'Employees',
            data: (store as IStore).employees,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

storeController.addEmployee = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        console.log(req.body);

        const { storeId, userEmail } = req.body;

        if (!storeId || !userEmail) {
            return res.status(400).json({
                error: 'Missing required fields',
            });
        }

        if (!validator.isMongoId(storeId) || !validator.isEmail(userEmail)) {
            return res.status(404).json({
                error: 'Invalid fields type',
            });
        }

        const store = await Store.findById(storeId);

        if (!store) {
            return res.status(404).json({
                error: 'Store not found',
            });
        }

        if (
            !store.author.toString() === (<any>req).user.id &&
            !store.managers.includes((<any>req).user.id)
        ) {
            return res.status(403).json({
                error: 'Unauthorized, you no are a store author, manager or admin',
            });
        }

        const storeOwner = await User.findById(store.author).populate('roles');

        if (!storeOwner!.roles.length) {
            return res.status(403).json({
                error: 'Unauthorized, you no have a roles',
            });
        }

        const storeOwnerRoleWithMaxEmplooyes = storeOwner?.roles.sort(
            (a, b) => {
                return b.permissions.maxEmployees - a.permissions.maxEmployees;
            }
        );

        if (
            storeOwnerRoleWithMaxEmplooyes &&
            storeOwnerRoleWithMaxEmplooyes[0] &&
            storeOwnerRoleWithMaxEmplooyes[0]?.permissions.maxEmployees ===
                store.employees.length
        ) {
            return res.status(403).json({
                error: 'maxEmployees reached!',
            });
        }

        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        if (store.employees.includes(user.id)) {
            return res.status(403).json({
                error: 'User already employee',
            });
        }

        store.employees.push(user.id);

        await store.save();

        return res.json({
            message: 'Employee Added',
            data: (await store.populate('employees')).employees,
        });
    } catch (error: any) {
        if (error.message.includes('is already taken')) {
            return res.json({
                error: 'Employee already exists.',
            });
        }
        return res.json({
            error: 'Internal Error',
        });
    }
};

storeController.deleteEmployee = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        console.log(req.body);

        const { storeId, userId } = req.body;

        if (!storeId || !userId) {
            return res.status(400).json({
                error: 'Missing required fields',
            });
        }

        if (!validator.isMongoId(storeId) || !validator.isMongoId(userId)) {
            return res.json({
                error: 'Invalid fields type',
            });
        }

        const store = await Store.findById(storeId);

        if (!store) {
            return res.status(404).json({
                error: 'Store not found',
            });
        }

        if (
            (store as IStore).author.toString() !== (<any>req).user.id &&
            !store.managers.includes((<any>req).user.id)
        ) {
            return res.status(403).json({
                error: 'Unauthorized, you no are a store author, manager or admin',
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        if (!store.employees.includes(userId)) {
            return res.status(403).json({
                error: 'User not employee',
            });
        }

        await Store.findByIdAndUpdate(storeId, {
            $pull: {
                employees: userId,
            },
        });

        return res.json({
            message: 'Employee Deleted',
            data: (await store.populate('employees')).employees,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.json({
            error: 'Internal Error',
        });
    }
};

storeController.getProducts = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { storeId } = <any>req.query;

        if (!storeId) {
            return res.status(400).json({
                error: 'Missing fields',
            });
        }

        if (!validator.isMongoId(storeId)) {
            return res.json({
                error: 'Invalid fields type',
            });
        }

        const store = await Store.findById(storeId).populate('products');

        await Store.populate(store, {
            path: 'products.author',
            select: '-salt -hash',
        });

        return res.json({
            message: 'Products',
            data: (store as IStore).products,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

storeController.soldProduct = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { storeId, productId } = <any>req.body;

        if (!storeId || !productId) {
            return res.status(400).json({
                error: 'Missing fields',
            });
        }

        if (!validator.isMongoId(storeId) || !validator.isMongoId(productId)) {
            return res.json({
                error: 'Invalid fields type',
            });
        }

        const store = await Store.findById(storeId);

        if (!store) {
            return res.status(404).json({
                error: 'Store not found',
            });
        }

        if (
            store.author.toString() !== (<any>req).user.id &&
            !store.managers.includes((<any>req).user.id) &&
            !store.employees.includes((<any>req).user.id)
        ) {
            return res.status(403).json({
                error: 'Unauthorized, You are not the author or employee of this store',
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                error: 'Product not found',
            });
        }

        if (product.stock === 0) {
            return res.status(409).json({
                error: 'Product out of stock',
            });
        }

        await Product.findOneAndUpdate(
            {
                _id: productId,
            },
            {
                $inc: {
                    stock: -1,
                    solds: 1,
                },
            }
        );

        return res.json({
            message: 'Product Sold.',
            data: product,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

storeController.createProduct = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        console.log(req.body);

        const {
            storeId,
            name,
            description,
            price,
            purchasePrice,
            categories,
            sizes,
            stock,
            imagePath,
        } = req.body;

        if (
            !storeId ||
            !name ||
            !description ||
            !price ||
            !purchasePrice ||
            !categories ||
            !sizes ||
            !stock ||
            !imagePath
        ) {
            return res.status(400).json({
                error: 'Missing fields',
            });
        }

        if (
            !validator.isMongoId(storeId) ||
            typeof name !== 'string' ||
            typeof description !== 'string' ||
            typeof price !== 'number' ||
            typeof purchasePrice !== 'number' ||
            typeof stock !== 'number' ||
            !Array.isArray(categories) ||
            !Array.isArray(sizes) ||
            !validator.isURL(imagePath)
        ) {
            return res.status(400).json({
                error: 'Invalid fields',
            });
        }

        const storeExist = await Store.findById(storeId);

        if (!storeExist) {
            return res.status(404).json({
                error: 'Store not found',
            });
        }

        if (
            (storeExist as IStore).author.toString() !== (<any>req).user.id &&
            !(storeExist as IStore).managers.includes((<any>req).user.id)
        ) {
            return res.status(403).json({
                error: 'Unauthorized',
            });
        }

        const storeOwner = await User.findById(storeExist.author).populate(
            'roles'
        );

        if (!storeOwner!.roles.length) {
            return res.status(403).json({
                error: 'Unauthorized, you no have a roles',
            });
        }

        const storeOwnerRoleWithMaxManagers = storeOwner?.roles.sort((a, b) => {
            return b.permissions.maxProducts - a.permissions.maxProducts;
        });

        if (
            storeOwnerRoleWithMaxManagers &&
            storeOwnerRoleWithMaxManagers[0] &&
            storeOwnerRoleWithMaxManagers[0]?.permissions.maxProducts ===
                (storeExist as IStore).products.length
        ) {
            return res.status(403).json({
                error: 'maxProducts reached!',
            });
        }

        const newProduct = new Product({
            storeId,
            name,
            description,
            price,
            purchasePrice,
            categories,
            sizes,
            stock,
            imagePath,
            author: (<any>req).user.id,
        });

        await newProduct.save();

        (storeExist as IStore).products.push(newProduct.id);

        await storeExist.save();

        return res.status(201).json({
            message: 'Product Created',
            data: newProduct,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

storeController.updateProduct = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        console.log(req.body);

        const {
            productId,
            name,
            description,
            price,
            purchasePrice,
            categories,
            sizes,
            stock,
            imagePath,
        } = req.body;

        if (
            !productId ||
            !name ||
            !description ||
            !price ||
            !purchasePrice ||
            !categories ||
            !sizes ||
            !stock ||
            !imagePath
        ) {
            return res.status(400).json({
                error: 'Missing fields',
            });
        }

        if (
            !validator.isMongoId(productId) ||
            typeof name !== 'string' ||
            typeof description !== 'string' ||
            typeof price !== 'number' ||
            typeof purchasePrice !== 'number' ||
            typeof stock !== 'number' ||
            !Array.isArray(categories) ||
            !Array.isArray(sizes) ||
            !validator.isURL(imagePath)
        ) {
            return res.status(400).json({
                error: 'Invalid fields',
            });
        }

        const productExist = await Product.findById(productId);

        if (!productExist) {
            return res.status(404).json({
                error: 'Product not found',
            });
        }

        const storeExist = await Store.findOne({
            products: productId,
        });

        if (!storeExist) {
            return res.status(404).json({
                error: 'Store not found',
            });
        }

        if (
            productExist.author.toString() !== (<any>req).user.id &&
            !(storeExist as IStore).managers.includes((<any>req).user.id)
        ) {
            return res.status(403).json({
                error: 'Unauthorized',
            });
        }

        await Product.findByIdAndUpdate(productId, {
            name,
            description,
            price,
            purchasePrice,
            categories,
            sizes,
            stock,
            imagePath,
        });

        return res.status(201).json({
            message: 'Product Updated',
            data: await Product.findById(productId),
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

storeController.deleteProduct = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        console.log(req.body);

        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                error: 'Missing fields',
            });
        }

        if (!validator.isMongoId(productId)) {
            return res.status(400).json({
                error: 'Invalid fields type',
            });
        }

        const productExist = await Product.findById(productId);

        if (!productExist) {
            return res.status(404).json({
                error: 'Product not found',
            });
        }

        const storeExist = await Store.findOne({
            products: productId,
        });

        if (!storeExist) {
            return res.status(404).json({
                error: 'Store not found',
            });
        }

        if (
            productExist.author.toString() !== (<any>req).user.id &&
            !(storeExist as IStore).managers.includes((<any>req).user.id)
        ) {
            return res.status(403).json({
                error: 'Unauthorized',
            });
        }
        await Store.findByIdAndUpdate(storeExist.id, {
            $pull: { products: productId },
        });

        await Product.findByIdAndDelete(productId);

        await Report.deleteMany({ product: productId });

        return res.json({
            message: 'Product and reports deleted',
            data: productExist,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

storeController.getReports = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { storeId } = req.query;

        if (!storeId) {
            return res.status(400).json({
                error: 'Missing fields',
            });
        }

        if (!validator.isMongoId(storeId as string)) {
            return res.status(400).json({
                error: 'Invalid fields type',
            });
        }

        const storeExist = await Store.findById(storeId);

        if (!storeExist) {
            return res.status(404).json({
                error: 'Store not found',
            });
        }

        if (
            storeExist.author.toString() !== (<any>req).user.id &&
            !(storeExist as IStore).managers.includes((<any>req).user.id)
        ) {
            return res.status(403).json({
                error: 'Unauthorized',
            });
        }

        const reports = await Report.find({
            store: storeId as string,
        })
            .populate({
                path: 'store',
                populate: {
                    path: 'author',
                    select: '-salt -hash',
                },
            })
            .populate({
                path: 'product',
                populate: {
                    path: 'author',
                    select: '-salt -hash',
                },
            })
            .populate({
                path: 'author',
                select: '-salt -hash',
            });

        return res.json({
            message: 'Reports',
            data: reports,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

storeController.createReport = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        console.log(req.body);

        const { storeId, productId, title, description, imagePath } = req.body;

        if (!storeId || !productId || !title || !description) {
            return res.status(400).json({
                error: 'Missing fields',
            });
        }

        if (
            typeof title !== 'string' ||
            !validator.isMongoId(storeId) ||
            !validator.isMongoId(productId) ||
            typeof description !== 'string' ||
            (imagePath && imagePath.length > 5 && !validator.isURL(imagePath))
        ) {
            return res.status(400).json({
                error: 'Invalid fields',
            });
        }

        const storeExist = await Store.findById(storeId);

        if (!storeExist) {
            return res.status(404).json({
                error: 'Store not found',
            });
        }

        if (
            storeExist.author.toString() !== (<any>req).user.id &&
            !(storeExist as IStore).managers.includes((<any>req).user.id) &&
            !(storeExist as IStore).employees.includes((<any>req).user.id)
        ) {
            return res.status(403).json({
                error: 'Unauthorized',
            });
        }

        const newReport = new Report({
            store: storeId,
            product: productId,
            title,
            description,
            imagePath,
            author: (<any>req).user.id,
        });

        await newReport.save();

        return res.status(201).json({
            message: 'Report Created',
            data: newReport,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

storeController.deleteReport = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        console.log(req.body);

        const { reportId } = req.body;

        if (!reportId) {
            return res.status(400).json({
                error: 'Missing fields',
            });
        }

        if (!validator.isMongoId(reportId)) {
            return res.status(400).json({
                error: 'Invalid fields type',
            });
        }

        const reportExist = await Report.findById(reportId);

        if (!reportExist) {
            return res.status(404).json({
                error: 'Report not found',
            });
        }

        const storeExist = await Store.findById(reportExist.store);

        if (!storeExist) {
            return res.status(404).json({
                error: 'Store not found',
            });
        }

        const productExist = await Product.findById(reportExist.product);

        if (!productExist) {
            return res.status(404).json({
                error: 'Product not found',
            });
        }

        if (
            storeExist.author.toString() !== (<any>req).user.id &&
            !storeExist.managers.includes((<any>req).user.id)
        ) {
            return res.status(403).json({
                error: 'Unauthorized',
            });
        }

        await Report.findByIdAndDelete(reportId);

        return res.json({
            message: 'Report Deleted',
            data: reportExist,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

export default storeController;
