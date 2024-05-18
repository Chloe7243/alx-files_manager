import { ObjectId } from 'mongodb';
import dbClient from './db';
import redisClient from './redis';

export default async (req) => {
  const token = req.headers['x-token'];
  const userID = await redisClient.get(`auth_${token}`);
  const user = await dbClient.findUser({ _id: ObjectId(userID) });
  return user;
};
