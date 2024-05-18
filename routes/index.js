import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const router = express.Router();

router.get('/stats', AppController.getStats);
router.get('/status', AppController.getStatus);
router.get('/users/me', UsersController.getMe);
router.post('/users', UsersController.postNew);
router.get('/files', FilesController.getIndex);
router.get('/files/:id', FilesController.getShow);
router.post('/files', FilesController.postUpload);
router.get('/connect', AuthController.getConnect);
router.put('/files/:id/data', FilesController.getFile);
router.get('/disconnect', AuthController.getDisconnect);
router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/unpublish', FilesController.putUnpublish);

export default router;
