import dbClient from '../utils/db';
import redisClient from '../utils/redis';

exports.getStatus = (req, res) => {
  const dbAlive = dbClient.isAlive();
  const redisAlive = redisClient.isAlive();
  if (redisAlive && dbAlive) {
    res.send(JSON.stringify({ redis: redisAlive, db: dbAlive }));
    res.statusCode = 200;
  }
  res.sendStatus(404);
};
exports.getStats = async (req, res) => {
  try {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();
    console.log(users);
    res.send(JSON.stringify({ users, files }));
    res.statusCode = 200;
  } catch (err) {
    res.sendStatus(404);
  }
};
