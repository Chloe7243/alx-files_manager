import fs from 'fs';
import { ObjectId } from 'mongodb';
import { v4 } from 'uuid';
import dbClient from '../utils/db';
import getUserByToken from '../utils/getUserByToken';
import throwError from '../utils/throwError';
import throwUnauthError from '../utils/throwUnauthError';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

if (!fs.existsSync(FOLDER_PATH)) {
  fs.mkdirSync(FOLDER_PATH, { recursive: true });
}

export default class FilesController {
  static async postUpload(req, res) {
    const user = await getUserByToken(req);
    const {
      name, type, data, parentId = 0, isPublic = false,
    } = req.body;

    if (user) {
      if (!name) {
        return throwError(res, 'Missing name');
      }
      if (!type || !['folder', 'file', 'image'].includes(type)) {
        return throwError(res, 'Missing type');
      }
      if (type !== 'folder' && !data) {
        return throwError(res, 'Missing data');
      }
      const file = await dbClient.findFile('_id', ObjectId(parentId));
      if (parentId) {
        if (!file) {
          return throwError(res, 'Parent not found');
        }
        if (file.type !== 'folder') {
          return throwError(res, 'Parent is not a folder');
        }
      }
      const newFile = {
        name,
        type,
        isPublic,
        parentId,
        userId: user._id,
      };

      if (type === 'folder') {
        const response = await dbClient.files.insertOne(newFile);
        return res.status(201).send(response.ops[0]);
      }
      const buffer = Buffer.from(data, 'base64');
      const localPath = `${FOLDER_PATH}/${v4()}`;
      fs.writeFileSync(localPath, buffer);
      const response = await dbClient.files.insertOne({
        localPath,
        ...newFile,
      });
      return res.status(201).send(response.ops[0]);
    }
    return throwUnauthError(res);
  }
}
