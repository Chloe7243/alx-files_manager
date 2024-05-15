import dbClient from '../utils/db';
import redisClient from '../utils/redis';

exports.getStatus = (req, res) => {
  const status = { redis: redisClient.isAlive(), db: dbClient.isAlive() };
  res.status(200).send(status);
};

exports.getStats = async (req, res) => {
  const stats = {
    users: await dbClient.nbUsers(),
    files: await dbClient.nbFiles(),
  };
  res.status(200).send(stats);
};
