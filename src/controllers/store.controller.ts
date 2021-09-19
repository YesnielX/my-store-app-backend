import { Request, Response } from 'express';
import validator from 'validator';

import Product from '../database/models/product.model';
import Store, { IStore } from '../database/models/store.model';

const storeController: any = {};

storeController.getStores = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { user } = <any>req;
        const stores = await Store.find({ author: user.id }).populate(
            'author',
            '-salt -hash'
        );
        return res.json({
            message: 'Stores',
            data: stores,
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
        console.log((<any>req).user);
        console.log(req.body);

        const { name, imagePath } = req.body;
        const newStore = new Store({
            name,
            imagePath,
            author: (<any>req).user.id,
        });
        const store = await newStore.save();

        return res.status(201).json({
            message: 'created',
            data: store.populate('author'),
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

storeController.deleteStore = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        console.log(req.body);

        return res.json({
            message: 'Store Deleted',
        });
    } catch (error: any) {
        console.log(error.message);
        if (error.message.includes('is already taken')) {
            return res.json({
                error: 'Store already exists.',
            });
        }
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
        const { storeId } = <any>req.body;

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
            portion,
            imagePath,
        } = req.body;

        if (
            !name ||
            !description ||
            !price ||
            !purchasePrice ||
            !categories ||
            !sizes ||
            !portion ||
            !imagePath
        ) {
            return res.status(400).json({
                error: 'Missing fields',
            });
        }

        if (
            typeof name !== 'string' ||
            typeof description !== 'string' ||
            typeof price !== 'number' ||
            typeof purchasePrice !== 'number' ||
            typeof portion !== 'number' ||
            !validator.isURL(imagePath)
        ) {
            return res.status(400).json({
                error: 'Invalid fields',
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
            portion,
            imagePath,
            author: (<any>req).user.id,
        });
        await newProduct.save();

        const store = await Store.findById(storeId);
        (store as IStore).products.push(newProduct.id);
        await store.save();

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
            portion,
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
            !portion ||
            !imagePath
        ) {
            return res.status(400).json({
                error: 'Missing fields',
            });
        }

        if (
            typeof productId !== 'string' ||
            typeof name !== 'string' ||
            typeof description !== 'string' ||
            typeof price !== 'number' ||
            typeof purchasePrice !== 'number' ||
            typeof portion !== 'number' ||
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

        if (productExist.author.toString() !== (<any>req).user.id) {
            return res.status(403).json({
                error: 'Unauthorized',
            });
        }

        const productUpdated = await Product.findByIdAndUpdate(productId, {
            name,
            description,
            price,
            purchasePrice,
            categories,
            sizes,
            portion,
            imagePath,
        });

        await productUpdated.save();

        return res.status(201).json({
            message: 'Product Updated',
            data: productUpdated,
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

        const productToDelete = await Product.findById(productId);

        if (!productToDelete) {
            return res.status(404).json({
                error: 'Product not found',
            });
        }

        if (productToDelete.author.toString() !== (<any>req).user.id) {
            return res.status(403).json({
                error: 'Unauthorized',
            });
        }

        await Product.findByIdAndDelete(productId);

        return res.json({
            message: 'Product Deleted',
            data: productToDelete,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal Error',
        });
    }
};

export default storeController;
