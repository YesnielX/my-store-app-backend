import express from 'express';

import admin from '../controllers/admin.controller';
import images from '../controllers/images.controller';
import store from '../controllers/store.controller';
import user from '../controllers/user.controller';
import tokenVerify from '../middlewares/auth';
import authAdmin from '../middlewares/authAdmin';

const router = express.Router();

// user endpoints -- no errors
router.route('/user').get(user.login).post(user.register);
router.get('/users', authAdmin, user.users);

// user roles endpoint -- no errors
router.route('/user/roles').get(user.getRoles).put(authAdmin, user.updateRoles);

// admin endpoints -- no errors
router
    .route('/admin')
    .get(admin.adminLogin)
    .post(admin.adminRegister)
    .put(authAdmin, admin.addAdmin)
    .delete(authAdmin, admin.removeAdmin);

// get admins endpoint -- no errors
router.get('/admins', authAdmin, admin.getAdmins);

// roles endpoints -- no errors
router
    .route('/admin/roles')
    .get(authAdmin, admin.getRoles)
    .post(authAdmin, admin.createRole)
    .put(authAdmin, admin.updateRole)
    .delete(authAdmin, admin.deleteRole);

// store endpoints -- no errors
router
    .route('/stores')
    .get(tokenVerify, store.getStores)
    .post(tokenVerify, store.createStore)
    .put(tokenVerify, store.updateStore)
    .delete(tokenVerify, store.deleteStore);

// store manager endpoints -- no erors
router
    .route('/store/managers')
    .get(tokenVerify, store.getManagers)
    .put(tokenVerify, store.addManager)
    .delete(tokenVerify, store.deleteManager);

// store employees endpoints -- no errors
router
    .route('/store/employees')
    .get(tokenVerify, store.getEmployees)
    .put(tokenVerify, store.addEmployee)
    .delete(tokenVerify, store.deleteEmployee);

// product endpoints -- no errors
router
    .route('/stores/products')
    .get(tokenVerify, store.getProducts)
    .post(tokenVerify, store.createProduct)
    .put(tokenVerify, store.updateProduct)
    .delete(tokenVerify, store.deleteProduct);

// sold product endpoint -- no errors
router.route('/stores/product').post(tokenVerify, store.soldProduct);

// images endpoints
router.route('/images').post(images.upload);

export default router;
