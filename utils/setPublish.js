import { ObjectId } from 'mongodb';
import dbClient from './db';
import getUserByToken from './getUserByToken';
import throwError from './throwError';
import throwUnauthError from './throwUnauthError';

export default async (req, res, isPublic) => {
  const user = await getUserByToken(req);
  const fileId = req.params.id;
  if (user) {
    const result = await dbClient.files.findOneAndUpdate(
      { _id: ObjectId(fileId), userId: user._id },
      { $set: { isPublic } },
      { returnDocument: 'after' },
    );
    if (!result.value) {
      return throwError(res, 'Not Found', 404);
    }
    return res.status(200).send(result.value);
  }
  return throwUnauthError(res);
};
