import express from 'express';

import user from '../controllers/user.controller';

const router = express.Router();

router.route('/user').get(user.login).post(user.register);
router.get('/users', user.users);

export default router;
