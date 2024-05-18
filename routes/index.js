import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';

const router = express.Router();

router.get('/stats', AppController.getStats);
router.get('/users/me', UsersController.getMe);
router.post('/users', UsersController.postNew);
router.get('/status', AppController.getStatus);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

export default router;
