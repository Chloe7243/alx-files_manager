import fs from 'fs';
// import Queue from 'bull';
import { v4 } from 'uuid';
import mime from 'mime-types';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import { fileQueue } from '../worker';
import setPublish from '../utils/setPublish';
import throwError from '../utils/throwError';
import getUserByToken from '../utils/getUserByToken';
import throwUnauthError from '../utils/throwUnauthError';

// const fileQueue = new Queue();

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
const PAGE_LIMIT = 20;

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
      const file = await dbClient.findFile({ _id: ObjectId(parentId) });
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
      const returnedValue = response.ops[0];
      if (type === 'image') {
        fileQueue.add('add image', { userId: returnedValue.userId, fileId: returnedValue._id });
      }
      return res.status(201).send(returnedValue);
    }
    return throwUnauthError(res);
  }

  static async getShow(req, res) {
    const user = await getUserByToken(req);
    const fileId = req.params.id;
    if (user) {
      const file = await dbClient.findFile({
        userId: user._id,
        _id: ObjectId(fileId),
      });
      if (!file) return throwError(res, 'Not found', 404);
      return res.status(200).send(file);
    }
    return throwUnauthError(res);
  }

  static async getIndex(req, res) {
    const user = await getUserByToken(req);
    const { parentId = 0, page = 0 } = req.query;
    if (user) {
      const files = await dbClient.files
        .find({ parentId, userId: user._id })
        .skip(page * PAGE_LIMIT)
        .limit(PAGE_LIMIT)
        .toArray();
      return res.status(200).send(files);
    }
    return throwUnauthError(res);
  }

  static async putPublish(req, res) {
    const data = await setPublish(req, res, true);
    return data;
  }

  static async putUnpublish(req, res) {
    const data = await setPublish(req, res, false);
    return data;
  }

  static async getFile(req, res) {
    const user = await getUserByToken(req);
    const fileId = req.params.id;
    if (user) {
      const file = await dbClient.findFile({
        userId: user._id,
        _id: ObjectId(fileId),
      });
      if (!file || !file.isPublic) return throwError(res, 'Not found', 404);
      if (file.type === 'folder') return throwError(res, "A folder doesn't have content");
      let data;
      const mineType = mime.lookup(file.name);
      res.setHeader(
        'content-type',
        mineType || 'text/plain; charset=utf-8',
      );
      try {
        data = fs.readFileSync(file.localPath);
      } catch (err) {
        return throwError(res, 'Not found', 404);
      }
      return res.status(200).send(data);
    }
    return throwUnauthError(res);
  }
}
