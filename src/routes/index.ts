import express from 'express';

import images from '../controllers/images.controller';
import store from '../controllers/store.controller';
import user from '../controllers/user.controller';
import { tokenVerify } from '../middlewares/auth';

const router = express.Router();

// auth endpoints
router.route('/user').get(user.login).post(user.register);
router.get('/users', user.users);

// store endpoints
router
    .route('/stores')
    .get(tokenVerify, store.getStores)
    .post(tokenVerify, store.createStore);

// product endpoints
router
    .route('/stores/products')
    .get(tokenVerify, store.getProducts)
    .post(tokenVerify, store.createProduct)
    .put(tokenVerify, store.updateProduct)
    .delete(tokenVerify, store.deleteProduct);

// images endpoints
router.route('/images').post(images.upload);

export default router;
